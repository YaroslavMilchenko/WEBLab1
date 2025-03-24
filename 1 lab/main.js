document.addEventListener("DOMContentLoaded", function () {
  const burger = document.querySelector(".burger");
  const mobileMenu = document.getElementById("mobile-menu");
  const modal = document.getElementById("modal");
  const closeModal = document.querySelector(".close");
  const createBtn = document.querySelector(".create");
  const tableBody = document.querySelector("table tbody");
  const rowsPerPage = 10;
  let currentPage = 1;
  let students = [];
  let editingIndex = null;
  const deleteModal = document.getElementById("delete-confirm");
  const deleteMessage = document.getElementById("delete-message");
  const confirmDelete = document.getElementById("confirm-delete");
  const cancelDelete = document.getElementById("cancel-delete");
  const addModal = document.getElementById("add-modal");
  const editModal = document.getElementById("edit-modal");
  const closeAddModal = document.getElementById("close-add");
  const closeEditModal = document.getElementById("close-edit");

  function toggleMenu() {
    const isOpen = mobileMenu.classList.toggle("show");
    burger.classList.toggle("open");
    mobileMenu.setAttribute("aria-hidden", !isOpen);
  }

  const closeBtn = document.querySelector(".close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", toggleMenu);
  }

  burger.addEventListener("click", toggleMenu);

  function formatDate(dateStr) {
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  }

  function unformatDate(dateStr) {
    const [day, month, year] = dateStr.split("-");
    return `${year}-${month}-${day}`;
  }

  function openModal(editIndex = null) {
    modal.style.display = "block";
    modal.setAttribute("aria-hidden", "false");
    editingIndex = editIndex;

    const nameField = document.getElementById("student-name");
    const groupField = document.getElementById("student-group");
    const birthdayField = document.getElementById("student-birthday");
    const genderField = document.getElementById("student-gender");

    if (editIndex !== null) {
      document.getElementById("modal-title").textContent = "Edit Student";
      nameField.value = students[editIndex].name;
      groupField.value = students[editIndex].group;
      birthdayField.value = unformatDate(students[editIndex].birthday);
      genderField.value = students[editIndex].gender;
      createBtn.textContent = "Save";
    } else {
      document.getElementById("modal-title").textContent = "Add Student";
      createBtn.textContent = "Create";
      nameField.value = "";
      groupField.value = "";
      birthdayField.value = "";
      genderField.value = "M";
    }
  }

  closeModal.addEventListener("click", function () {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    editingIndex = null;
  });

  createBtn.addEventListener("click", function (event) {
    event.preventDefault();

    let name = document.getElementById("student-name").value;
    let group = document.getElementById("student-group").value;
    let birthday = document.getElementById("student-birthday").value;
    let gender = document.getElementById("student-gender").value;

    if (name === "" || group === "" || birthday === "") {
      alert("Fill all fields!");
      return;
    }

    const formattedBirthday = formatDate(birthday);

    if (editingIndex !== null) {
      students[editingIndex].name = name;
      students[editingIndex].group = group;
      students[editingIndex].birthday = formattedBirthday;
      students[editingIndex].gender = gender;
    } else {
      students.push({
        group,
        name,
        gender,
        birthday: formattedBirthday,
        status: "Online"
      });
    }

    paginateTable();
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    editingIndex = null;
  });

  function paginateTable() {
    const totalPages = Math.ceil(students.length / rowsPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;

    tableBody.innerHTML = "";
    renderTableHeader();

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    students.slice(start, end).forEach((student, index) => {
      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td><input type="checkbox" class="student-checkbox" data-index="${start + index}" aria-label="Select student ${student.name}"></td>
        <td>${student.group}</td>
        <td>${student.name}</td>
        <td>${student.gender}</td>
        <td>${student.birthday}</td>
        <td><span class="status online">${student.status}</span></td>
        <td>
          <button class="edit" data-index="${start + index}" aria-label="Edit student ${student.name}"><i class="fa-solid fa-pen"></i></button>
          <button class="delete" data-index="${start + index}" aria-label="Delete student ${student.name}"><i class="fa-solid fa-x"></i></button>
        </td>
      `;
      tableBody.appendChild(newRow);
    });

    addEventListeners();
    renderPaginationControls(totalPages);
  }

  function addEventListeners() {
    document.querySelectorAll(".edit").forEach(button => {
      button.addEventListener("click", function () {
        openModal(this.dataset.index);
      });
    });

    document.querySelectorAll(".delete").forEach(button => {
      button.addEventListener("click", function () {
        const index = this.dataset.index;
        const checkedBoxes = document.querySelectorAll(".student-checkbox:checked");
        
        if (checkedBoxes.length > 0) {
          deleteMessage.textContent = `Are you sure you want to delete ${checkedBoxes.length} student${checkedBoxes.length > 1 ? "s" : ""}?`;
          deleteModal.style.display = "block";
          deleteModal.setAttribute("aria-hidden", "false");
          
          confirmDelete.onclick = () => {
            const indices = Array.from(checkedBoxes).map(cb => parseInt(cb.dataset.index)).sort((a, b) => b - a);
            indices.forEach(idx => students.splice(idx, 1));
            paginateTable();
            deleteModal.style.display = "none";
            deleteModal.setAttribute("aria-hidden", "true");
          };
          
          cancelDelete.onclick = () => {
            deleteModal.style.display = "none";
            deleteModal.setAttribute("aria-hidden", "true");
          };
        } else {
          deleteMessage.textContent = `Are you sure you want to delete ${students[index].name}?`;
          deleteModal.style.display = "block";
          deleteModal.setAttribute("aria-hidden", "false");
          
          confirmDelete.onclick = () => {
            students.splice(index, 1);
            paginateTable();
            deleteModal.style.display = "none";
            deleteModal.setAttribute("aria-hidden", "true");
          };
          
          cancelDelete.onclick = () => {
            deleteModal.style.display = "none";
            deleteModal.setAttribute("aria-hidden", "true");
          };
        }
      });
    });

    const selectAllCheckbox = document.querySelector("#select-all");
    const checkboxes = document.querySelectorAll(".student-checkbox");

    selectAllCheckbox.addEventListener("change", function () {
      checkboxes.forEach(checkbox => {
        checkbox.checked = this.checked;
      });
    });

    checkboxes.forEach(checkbox => {
      checkbox.addEventListener("change", () => {
        if (!checkbox.checked) {
          selectAllCheckbox.checked = false;
        } else if (document.querySelectorAll(".student-checkbox:checked").length === checkboxes.length) {
          selectAllCheckbox.checked = true;
        }
      });
    });
  }

  function renderTableHeader() {
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = `
      <th>
        <label for="select-all" class="sr-only">Select all students</label>
        <input type="checkbox" id="select-all" aria-label="Select all students">
      </th>
      <th>Group</th>
      <th>Name</th>
      <th>Gender</th>
      <th>Birthday</th>
      <th>Status</th>
      <th>Option</th>
    `;
    tableBody.appendChild(headerRow);
  }

  function renderPaginationControls(totalPages) {
    let paginationContainer = document.getElementById("pagination");
    if (!paginationContainer) {
      paginationContainer = document.createElement("div");
      paginationContainer.id = "pagination";
      document.querySelector(".table").appendChild(paginationContainer);
    }

    paginationContainer.innerHTML = "";

    if (totalPages > 1) {
      const prevButton = document.createElement("button");
      prevButton.textContent = "<";
      prevButton.classList.add("page-btn");
      prevButton.disabled = currentPage === 1;
      prevButton.setAttribute("aria-label", "Previous page");
      prevButton.addEventListener("click", function () {
        if (currentPage > 1) {
          currentPage--;
          paginateTable();
        }
      });
      paginationContainer.appendChild(prevButton);

      for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement("button");
        pageButton.textContent = i;
        pageButton.classList.add("page-btn");
        pageButton.setAttribute("aria-label", `Page ${i}`);
        if (i === currentPage) pageButton.classList.add("active");
        pageButton.addEventListener("click", function () {
          currentPage = i;
          paginateTable();
        });
        paginationContainer.appendChild(pageButton);
      }

      const nextButton = document.createElement("button");
      nextButton.textContent = ">";
      nextButton.classList.add("page-btn");
      nextButton.setAttribute("aria-label", "Next page");
      nextButton.disabled = currentPage === totalPages;
      nextButton.addEventListener("click", function () {
        if (currentPage < totalPages) {
          currentPage++;
          paginateTable();
        }
      });
      paginationContainer.appendChild(nextButton);
    }
  }

  const messages = document.querySelectorAll(".message");
  const notificationIndicator = document.querySelector(".notification-indicator");

  messages.forEach((message) => {
    message.addEventListener("click", () => {
      if (message.classList.contains("unread")) {
        message.classList.remove("unread");
        message.classList.add("read");
        notificationIndicator.classList.remove("active");
      }
    });
  });

  if (document.querySelector(".unread")) {
    notificationIndicator.classList.add("active");
  }

  paginateTable();
  window.openModal = openModal;

  if (closeAddModal) {
    closeAddModal.addEventListener("click", function () {
      addModal.style.display = "none";
      addModal.setAttribute("aria-hidden", "true");
    });
  }

  if (closeEditModal) {
    closeEditModal.addEventListener("click", function () {
      editModal.style.display = "none";
      editModal.setAttribute("aria-hidden", "true");
    });
  }
});