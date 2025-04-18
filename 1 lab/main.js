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
    let students = [];
    let editingId = null;
    const deleteModal = document.getElementById("delete-confirm");
    const deleteMessage = document.getElementById("delete-message");
    const confirmDelete = document.getElementById("confirm-delete");
    const cancelDelete = document.getElementById("cancel-delete");

    // Завантаження студентів із localStorage при старті
    students = JSON.parse(localStorage.getItem("students")) || [];

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

    // Відкриття модального вікна для додавання
    function openModal() {
        console.log("Opening add modal");
        addModal.style.display = "block";
        addModal.classList.remove("hidden");
        document.getElementById("add-student-id").value = "";
        document.getElementById("add-name").value = "";
        document.getElementById("add-group").value = "";
        document.getElementById("add-gender").value = "M";
        document.getElementById("add-birthday").value = "";
    }

    // Відкриття модального вікна для редагування
    function openEditModal(id) {
        console.log("Opening edit modal for student ID:", id);
        console.log("Current students array:", students);
        const student = students.find(s => s.id === id);
        if (!student) {
            console.error("Student not found with ID:", id);
            return;
        }
        console.log("Student found:", student);
        editModal.style.display = "block";
        editModal.classList.remove("hidden");
        document.getElementById("edit-student-id").value = student.id;
        document.getElementById("edit-name").value = student.name;
        document.getElementById("edit-group").value = student.group;
        document.getElementById("edit-gender").value = student.gender;
        document.getElementById("edit-birthday").value = unformatDate(student.birthday);
    }

    // Закриття модальних вікон
    closeAddModal.addEventListener("click", function () {
        addModal.style.display = "none";
    });

    closeEditModal.addEventListener("click", function () {
        editModal.style.display = "none";
        editingId = null;
    });

    // Валідація форми
    function validateForm(prefix) {
        console.log(`Validating form with prefix: ${prefix}`);
        const name = document.getElementById(`${prefix}-name`).value;
        const group = document.getElementById(`${prefix}-group`).value;
        const birthday = document.getElementById(`${prefix}-birthday`).value;

        const nameRegex = /^[A-Za-z\s'-]{2,}$/;
        const groupRegex = /^[A-Za-z0-9-]{2,}$/;

        let isValid = true;

        // Перевірка на наявність слова "select" у імені (регістронезалежна)
        if (name.toLowerCase().includes("select")) {
            document.getElementById(`${prefix}-name-error`).textContent = "Name cannot contain the word 'select'";
            document.getElementById(`${prefix}-name-error`).style.display = "block";
            isValid = false;
            return isValid; // Зупиняємо валідацію, якщо знайдено "select"
        }

        // Перевірка на кількість символів @
        const atSymbolCount = (name.match(/@/g) || []).length;
        if (atSymbolCount > 1) {
            document.getElementById(`${prefix}-name-error`).textContent = "Name cannot contain more than one @ symbol";
            document.getElementById(`${prefix}-name-error`).style.display = "block";
            isValid = false;
            return isValid; // Зупиняємо валідацію, якщо більше одного @
        }

        // Перевірка на email (наявність @)
        if (name.includes("@")) {
            if (name.endsWith("@lpnu.ua")) {
                // Якщо email закінчується на @lpnu.ua, показуємо повідомлення і дозволяємо валідацію
                alert("Привіт політехнік!");
                document.getElementById(`${prefix}-name-error`).style.display = "none";
                isValid = true; // Явно дозволяємо валідацію
            } else {
                // Якщо це інший email, валідація не проходить
                alert("You can't use any email, exept @lpnu.ua");
                document.getElementById(`${prefix}-name-error`).style.display = "block";
                isValid = false;
            }
        } else {
            // Якщо це не email, перевіряємо за базовим регулярним виразом
            console.log(`Name: ${name}, Regex test: ${nameRegex.test(name)}`);
            if (!nameRegex.test(name)) {
                document.getElementById(`${prefix}-name-error`).textContent = "Only letters, spaces, apostrophes, and hyphens, min 2 characters";
                document.getElementById(`${prefix}-name-error`).style.display = "block";
                isValid = false;
            } else {
                document.getElementById(`${prefix}-name-error`).style.display = "none";
            }
        }

        // Перевірка групи
        if (!groupRegex.test(group)) {
            document.getElementById(`${prefix}-group-error`).textContent = "none";
            document.getElementById(`${prefix}-group-error`).style.display = "block";
            isValid = false;
        } else {
            document.getElementById(`${prefix}-group-error`).style.display = "none";
        }

        // Перевірка дати народження
        if (!birthday) {
            document.getElementById(`${prefix}-birthday-error`).textContent = "Please select a valid date";
            document.getElementById(`${prefix}-birthday-error`).style.display = "block";
            isValid = false;
        } else {
            document.getElementById(`${prefix}-name-error`).style.display = "none";
        }

        console.log(`Form validation result: ${isValid}`);
        return isValid;
    }

    // Додавання студента
    addForm.addEventListener("submit", function (event) {
        event.preventDefault();
        console.log("Submitting add-student-form");

        if (!validateForm("add")) return;

        const id = Date.now().toString();
        const name = document.getElementById("add-name").value;
        const group = document.getElementById("add-group").value;
        const gender = document.getElementById("add-gender").value;
        const birthday = formatDate(document.getElementById("add-birthday").value);

        const studentData = { id, name, group, gender, birthday, status: "Online" };
        students.push(studentData);
        localStorage.setItem("students", JSON.stringify(students));

        console.log("Added Student (JSON):", JSON.stringify(studentData, null, 2));
        console.log("Current students array:", students);
        paginateTable();
        addModal.style.display = "none";
    });

    // Редагування студента
    editForm.addEventListener("submit", function (event) {
        event.preventDefault();

        console.log("Edit form submitted");
        if (!validateForm("edit")) {
            console.log("Validation failed for edit form");
            return;
        }

        const id = document.getElementById("edit-student-id").value;
        const name = document.getElementById("edit-name").value;
        const group = document.getElementById("edit-group").value;
        const gender = document.getElementById("edit-gender").value;
        const birthday = formatDate(document.getElementById("edit-birthday").value);
        const studentData = { id, name, group, gender, birthday, status: "Online" };
        const index = students.findIndex(s => s.id === id);
        if (index === -1) {
            console.error("Student not found for editing with ID:", id);
            return;
        }
        students[index] = studentData;
        localStorage.setItem("students", JSON.stringify(students));

        console.log("Edited Student (JSON):", JSON.stringify(studentData, null, 2));
        paginateTable();
        editModal.style.display = "none";
        editingId = null;
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
                <td><input type="checkbox" class="student-checkbox" data-index="${start + index}" data-id="${student.id}" aria-label="Select student ${student.name}"></td>
                <td>${student.group}</td>
                <td>${student.name}</td>
                <td>${student.gender}</td>
                <td>${student.birthday}</td>
                <td><span class="status online">${student.status}</span></td>
                <td>
                    <button class="edit" data-id="${student.id}" aria-label="Edit student ${student.name}"><i class="fa-solid fa-pen"></i></button>
                    <button class="delete" data-index="${start + index}" aria-label="Delete student ${student.name}"><i class="fa-solid fa-x"></i></button>
                </td>
            `;
            tableBody.appendChild(newRow);
        });

        console.log("Table updated, adding event listeners");
        addEventListeners();
        renderPaginationControls(totalPages);
    }

    function addEventListeners() {
        document.querySelectorAll(".delete").forEach(button => {
            button.addEventListener("click", function () {
                const index = this.dataset.index;
                const checkedBoxes = document.querySelectorAll(".student-checkbox:checked");
                
                if (checkedBoxes.length > 0) {
                    deleteMessage.textContent = `Are you sure you want to delete ${checkedBoxes.length} student${checkedBoxes.length > 1 ? "s" : ""}?`;
                    deleteModal.style.display = "block";
                    
                    confirmDelete.onclick = () => {
                        const indices = Array.from(checkedBoxes).map(cb => parseInt(cb.dataset.index)).sort((a, b) => b - a);
                        indices.forEach(idx => students.splice(idx, 1));
                        localStorage.setItem("students", JSON.stringify(students));
                        paginateTable();
                        deleteModal.style.display = "none";
                    };
                    
                    cancelDelete.onclick = () => {
                        deleteModal.style.display = "none";
                    };
                } else {
                    deleteMessage.textContent = `Are you sure you want to delete ${students[index].name}?`;
                    deleteModal.style.display = "block";
                    
                    confirmDelete.onclick = () => {
                        students.splice(index, 1);
                        localStorage.setItem("students", JSON.stringify(students));
                        paginateTable();
                        deleteModal.style.display = "none";
                    };
                    
                    cancelDelete.onclick = () => {
                        deleteModal.style.display = "none";
                    };
                }
            });
        });

        const editButtons = document.querySelectorAll(".edit");
        console.log(`Found ${editButtons.length} edit buttons`);
        editButtons.forEach(button => {
            console.log("Adding event listener to edit button with ID:", button.dataset.id);
            button.addEventListener("click", function () {
                const id = this.dataset.id;
                console.log("Edit button clicked for ID:", id);
                openEditModal(id);
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

    // Реєстрація сервіс-воркера для PWA
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