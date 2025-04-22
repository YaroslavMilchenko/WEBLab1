document.addEventListener("DOMContentLoaded", function () {
    console.log("main.js loaded successfully");

    const burger = document.querySelector(".burger");
    const mobileMenu = document.getElementById("mobile-menu");
    const addModal = document.getElementById("add-modal");
    const editModal = document.getElementById("edit-modal");
    const closeAddModal = document.getElementById("close-add");
    const closeEditModal = document.getElementById("close-edit");
    const addForm = document.getElementById("add-student-form");
    const editForm = document.getElementById("edit-student-form");
    const tableBody = document.querySelector("#student-table");
    const rowsPerPage = 10;
    let currentPage = 1;
    const deleteModal = document.getElementById("delete-confirm");
    const deleteMessage = document.getElementById("delete-message");
    const confirmDelete = document.getElementById("confirm-delete");
    const cancelDelete = document.getElementById("cancel-delete");

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
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    function openModal() {
        console.log("Opening add modal");
        addModal.style.display = "block";
        addModal.classList.remove("hidden");
        document.getElementById("add-student-id").value = "";
        document.getElementById("add-party").value = "";
        document.getElementById("add-name").value = "";
        document.getElementById("add-gender").value = "M";
        document.getElementById("add-birthday").value = "";
    }

    function openEditModal(id, student) {
        console.log("Opening edit modal for student ID:", id);
        editModal.style.display = "block";
        editModal.classList.remove("hidden");
        document.getElementById("edit-student-id").value = student.StudentId;
        document.getElementById("edit-party").value = student.Party;
        document.getElementById("edit-name").value = student.Name;
        document.getElementById("edit-gender").value = student.Gender;
        document.getElementById("edit-birthday").value = student.Birthday.split('T')[0];
    }

    closeAddModal.addEventListener("click", function () {
        addModal.style.display = "none";
    });

    closeEditModal.addEventListener("click", function () {
        editModal.style.display = "none";
    });

    function validateForm(prefix) {
        const party = document.getElementById(`${prefix}-party`).value;
        const name = document.getElementById(`${prefix}-name`).value;
        const birthday = document.getElementById(`${prefix}-birthday`).value;

        const nameRegex = /^([A-Za-z\s'-]{2,})$|^[^@]+@lpnu\.ua$/;
        const partyRegex = /^[A-Za-z0-9-]{2,}$/;

        let isValid = true;

        if (!nameRegex.test(name)) {
            document.getElementById(`${prefix}-name-error`).textContent = "Invalid name or email format";
            document.getElementById(`${prefix}-name-error`).style.display = "block";
            isValid = false;
        } else {
            document.getElementById(`${prefix}-name-error`).style.display = "none";
        }

        if (!partyRegex.test(party)) {
            document.getElementById(`${prefix}-party-error`).textContent = "Invalid party format";
            document.getElementById(`${prefix}-party-error`).style.display = "block";
            isValid = false;
        } else {
            document.getElementById(`${prefix}-party-error`).style.display = "none";
        }

        if (!birthday) {
            document.getElementById(`${prefix}-birthday-error`).textContent = "Please select a valid date";
            document.getElementById(`${prefix}-birthday-error`).style.display = "block";
            isValid = false;
        } else {
            document.getElementById(`${prefix}-birthday-error`).style.display = "none";
        }

        return isValid;
    }

    async function fetchStudents(page = 1) {
        const response = await fetch(`api.php?action=getStudents&page=${page}`);
        const data = await response.json();
        if (!data.success) {
            if (data.error === 'Unauthorized') {
                window.location.href = 'login.php';
            }
            throw new Error(data.error);
        }
        return data;
    }

    addForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        if (!validateForm("add")) return;

        const formData = new FormData();
        formData.append("party", document.getElementById("add-party").value);
        formData.append("name", document.getElementById("add-name").value);
        formData.append("gender", document.getElementById("add-gender").value);
        formData.append("birthday", document.getElementById("add-birthday").value);

        const response = await fetch("api.php?action=createStudent", {
            method: "POST",
            body: formData
        });
        const result = await response.json();

        if (result.success) {
            paginateTable();
            addModal.style.display = "none";
        } else {
            document.getElementById("add-name-error").textContent = result.errors.join(", ");
            document.getElementById("add-name-error").style.display = "block";
        }
    });

    editForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        if (!validateForm("edit")) return;

        const formData = new FormData();
        formData.append("id", document.getElementById("edit-student-id").value);
        formData.append("party", document.getElementById("edit-party").value);
        formData.append("name", document.getElementById("edit-name").value);
        formData.append("gender", document.getElementById("edit-gender").value);
        formData.append("birthday", document.getElementById("edit-birthday").value);

        const response = await fetch("api.php?action=updateStudent", {
            method: "POST",
            body: formData
        });
        const result = await response.json();

        if (result.success) {
            paginateTable();
            editModal.style.display = "none";
        } else {
            document.getElementById("edit-name-error").textContent = result.errors.join(", ");
            document.getElementById("edit-name-error").style.display = "block";
        }
    });

    async function paginateTable() {
        const data = await fetchStudents(currentPage);
        const students = data.students;
        const totalPages = data.totalPages;

        tableBody.innerHTML = "";
        renderTableHeader();

        students.forEach((student) => {
            const newRow = document.createElement("tr");
            newRow.innerHTML = `
                <td><input type="checkbox" class="student-checkbox" data-id="${student.StudentId}" aria-label="Select student ${student.Name}"></td>
                <td>${student.Party}</td>
                <td>${student.Name}</td>
                <td>${student.Gender}</td>
                <td>${formatDate(student.Birthday)}</td>
                <td><span class="status ${student.Status === 1 ? 'online' : 'offline'}">${student.Status === 1 ? 'Online' : 'Offline'}</span></td>
                <td>
                    <button class="edit" data-id="${student.StudentId}" aria-label="Edit student ${student.Name}"><i class="fa-solid fa-pen"></i></button>
                    <button class="delete" data-id="${student.StudentId}" aria-label="Delete student ${student.Name}"><i class="fa-solid fa-x"></i></button>
                </td>
            `;
            tableBody.appendChild(newRow);
        });

        addEventListeners();
        renderPaginationControls(totalPages);
    }

    function addEventListeners() {
        document.querySelectorAll(".delete").forEach(button => {
            button.addEventListener("click", async function () {
                const id = this.dataset.id;
                deleteMessage.textContent = `Are you sure you want to delete this student?`;
                deleteModal.style.display = "block";

                confirmDelete.onclick = async () => {
                    const formData = new FormData();
                    formData.append("id", id);
                    const response = await fetch("api.php?action=deleteStudent", {
                        method: "POST",
                        body: formData
                    });
                    const result = await response.json();

                    if (result.success) {
                        paginateTable();
                    } else {
                        alert(result.error);
                    }
                    deleteModal.style.display = "none";
                };

                cancelDelete.onclick = () => {
                    deleteModal.style.display = "none";
                };
            });
        });

        document.querySelectorAll(".edit").forEach(button => {
            button.addEventListener("click", function () {
                const id = this.dataset.id;
                const student = Array.from(tableBody.querySelectorAll('tr')).slice(1).find(row => {
                    return row.querySelector('.edit').dataset.id === id;
                });
                const studentData = {
                    StudentId: id,
                    Party: student.cells[1].textContent,
                    Name: student.cells[2].textContent,
                    Gender: student.cells[3].textContent,
                    Birthday: student.cells[4].textContent.split('-').reverse().join('-'),
                    Status: student.cells[5].textContent === 'Online' ? 1 : 0
                };
                openEditModal(id, studentData);
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
            <th>Party</th>
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
        paginationContainer.innerHTML = "";

        if (totalPages > 1) {
            const prevButton = document.createElement("button");
            prevButton.textContent = "<";
            prevButton.classList.add("page-btn");
            prevButton.disabled = currentPage === 1;
            prevButton.setAttribute("aria-label", "Previous page");
            prevButton.addEventListener("click", async function () {
                if (currentPage > 1) {
                    currentPage--;
                    await paginateTable();
                }
            });
            paginationContainer.appendChild(prevButton);

            for (let i = 1; i <= totalPages; i++) {
                const pageButton = document.createElement("button");
                pageButton.textContent = i;
                pageButton.classList.add("page-btn");
                pageButton.setAttribute("aria-label", `Page ${i}`);
                if (i === currentPage) pageButton.classList.add("active");
                pageButton.addEventListener("click", async function () {
                    currentPage = i;
                    await paginateTable();
                });
                paginationContainer.appendChild(pageButton);
            }

            const nextButton = document.createElement("button");
            nextButton.textContent = ">";
            nextButton.classList.add("page-btn");
            nextButton.setAttribute("aria-label", "Next page");
            nextButton.disabled = currentPage === totalPages;
            nextButton.addEventListener("click", async function () {
                if (currentPage < totalPages) {
                    currentPage++;
                    await paginateTable();
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

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/service-worker.js")
            .then(registration => {
                console.log("Service Worker Registered:", registration);
            })
            .catch(err => {
                console.error("Service Worker Registration Failed:", err);
            });
    }
});