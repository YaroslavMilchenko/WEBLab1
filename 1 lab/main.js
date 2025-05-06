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
    const table = document.querySelector("#student-table");
    const tableBody = table.querySelector("tbody") || document.createElement("tbody");
    const rowsPerPage = 10;
    let currentPage = 1;
    const deleteModal = document.getElementById("delete-confirm");
    const deleteMessage = document.getElementById("delete-message");
    const confirmDelete = document.getElementById("confirm-delete");
    const cancelDelete = document.getElementById("cancel-delete");
    let isLoading = false;

    if (!table.querySelector("tbody")) {
        table.appendChild(tableBody);
    }

    function toggleMenu() {
        const isOpen = mobileMenu.classList.toggle("show");
        burger.classList.toggle("open");
        mobileMenu.setAttribute("aria-hidden", !isOpen);
    }

    const closeBtn = document.querySelector(".close-btn");
    if (closeBtn) {
        closeBtn.addEventListener("click", toggleMenu);
    }

    if (burger) {
        burger.addEventListener("click", toggleMenu);
    }

    function formatDate(dateStr) {
        console.log("Formatting date:", dateStr);
        if (!dateStr || dateStr === '0000-00-00' || !dateStr.trim()) {
            console.log("Invalid or missing date, returning N/A");
            return 'N/A';
        }
        const dateParts = dateStr.split('-');
        if (dateParts.length !== 3) {
            console.log("Invalid date format, returning N/A");
            return 'N/A';
        }
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // Месяцы в JavaScript начинаются с 0
        const day = parseInt(dateParts[2], 10);
        const date = new Date(year, month, day);
        if (isNaN(date.getTime())) {
            console.log("Date object creation failed, returning N/A");
            return 'N/A';
        }
        const formattedDate = `${String(day).padStart(2, '0')}-${String(month + 1).padStart(2, '0')}-${year}`;
        console.log("Formatted date:", formattedDate);
        return formattedDate;
    }

    function openModal() {
        console.log("Opening add modal");
        if (addModal) {
            addModal.style.display = "block";
            addModal.classList.remove("hidden");
            document.getElementById("add-student-id").value = "";
            document.getElementById("add-party").value = "";
            document.getElementById("add-name").value = "";
            document.getElementById("add-gender").value = "M";
            document.getElementById("add-birthday").value = "";
        }
    }

    function openEditModal(id, student) {
        console.log("Opening edit modal for student ID:", id, "with data:", student);
        if (editModal) {
            editModal.style.display = "block";
            editModal.classList.remove("hidden");
            document.getElementById("edit-student-id").value = id;
            document.getElementById("edit-party").value = student.party || '';
            document.getElementById("edit-name").value = student.name || '';
            document.getElementById("edit-gender").value = student.gender || 'M';
            document.getElementById("edit-birthday").value = student.birthday && student.birthday !== 'N/A' ? student.birthday.split('-').reverse().join('-') : '';
        }
    }

    if (closeAddModal) {
        closeAddModal.addEventListener("click", function () {
            if (addModal) addModal.style.display = "none";
        });
    }

    if (closeEditModal) {
        closeEditModal.addEventListener("click", function () {
            if (editModal) editModal.style.display = "none";
        });
    }

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
        if (isLoading) return { success: false, students: [], totalPages: 1 };
        isLoading = true;
        try {
            const response = await fetch(`students.php?action=getStudents&page=${page}`, {
                credentials: 'same-origin'
            });
            const data = await response.json();
            console.log("Raw response from students.php:", JSON.stringify(data, null, 2));
            if (!data.success) {
                throw new Error(data.error || 'Unknown error');
            }
            isLoading = false;
            return { success: true, students: data.data.students || [], totalPages: data.data.totalPages || 1 };
        } catch (error) {
            console.error("Fetch students error:", error);
            isLoading = false;
            return { success: false, students: [], totalPages: 1 };
        }
    }

    if (addForm) {
        addForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            if (!validateForm("add")) return;

            const formData = new FormData();
            formData.append("party", document.getElementById("add-party").value);
            formData.append("name", document.getElementById("add-name").value);
            formData.append("gender", document.getElementById("add-gender").value);
            formData.append("birthday", document.getElementById("add-birthday").value);

            console.log("Submitting new student data:", {
                party: document.getElementById("add-party").value,
                name: document.getElementById("add-name").value,
                gender: document.getElementById("add-gender").value,
                birthday: document.getElementById("add-birthday").value
            });

            const response = await fetch("students.php?action=createStudent", {
                method: "POST",
                body: formData,
                credentials: 'same-origin'
            });
            const result = await response.json();

            if (result.success) {
                paginateTable();
                if (addModal) addModal.style.display = "none";
            } else {
                document.getElementById("add-name-error").textContent = result.error || (result.errors ? result.errors.join(", ") : 'Unknown error');
                document.getElementById("add-name-error").style.display = "block";
            }
        });
    }

    if (editForm) {
        editForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            if (!validateForm("edit")) return;

            const formData = new FormData();
            formData.append("id", document.getElementById("edit-student-id").value);
            formData.append("party", document.getElementById("edit-party").value);
            formData.append("name", document.getElementById("edit-name").value);
            formData.append("gender", document.getElementById("edit-gender").value);
            formData.append("birthday", document.getElementById("edit-birthday").value);

            console.log("Submitting updated student data:", {
                id: document.getElementById("edit-student-id").value,
                party: document.getElementById("edit-party").value,
                name: document.getElementById("edit-name").value,
                gender: document.getElementById("edit-gender").value,
                birthday: document.getElementById("edit-birthday").value
            });

            const response = await fetch("students.php?action=updateStudent", {
                method: "POST",
                body: formData,
                credentials: 'same-origin'
            });
            const result = await response.json();

            if (result.success) {
                paginateTable();
                if (editModal) editModal.style.display = "none";
            } else {
                document.getElementById("edit-name-error").textContent = result.error || (result.errors ? result.errors.join(", ") : 'Unknown error');
                document.getElementById("edit-name-error").style.display = "block";
            }
        });
    }

    async function paginateTable() {
        const data = await fetchStudents(currentPage);
        console.log("Fetched data for pagination:", JSON.stringify(data, null, 2));
        const students = data.students || []; // Исправлено
        const totalPages = data.totalPages || 1;

        tableBody.innerHTML = "";

        if (students.length === 0) {
            console.log("No students found, displaying empty table message.");
            const row = document.createElement("tr");
            row.innerHTML = `<td colspan="7">No students found</td>`;
            tableBody.appendChild(row);
        } else {
            students.forEach((student, index) => {
                console.log(`Processing student ${index + 1}:`, student);

                const id = student.id ?? 'N/A';
                const party = student.party ?? 'N/A';
                const name = student.name ?? 'N/A';
                const gender = student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : 'N/A';
                const birthday = student.birthday ? formatDate(student.birthday) : 'N/A';
                const status = student.status === 1 ? 'Online' : 'Offline';

                const newRow = document.createElement("tr");
                newRow.innerHTML = `
                    <td><input type="checkbox" class="student-checkbox" data-id="${id}" aria-label="Select student ${name}"></td>
                    <td>${party}</td>
                    <td>${name}</td>
                    <td>${gender}</td>
                    <td>${birthday}</td>
                    <td><span class="status ${status === 'Online' ? 'online' : 'offline'}">${status}</span></td>
                    <td>
                        <button class="edit" data-id="${id}" aria-label="Edit student ${name}"><i class="fa-solid fa-pen"></i></button>
                        <button class="delete" data-id="${id}" aria-label="Delete student ${name}"><i class="fa-solid fa-x"></i></button>
                    </td>
                `;
                tableBody.appendChild(newRow);
            });
        }

        addEventListeners();
        renderPaginationControls(totalPages);
    }

    function addEventListeners() {
        document.querySelectorAll(".delete").forEach(button => {
            button.addEventListener("click", async function () {
                const id = this.dataset.id;
                if (deleteModal && deleteMessage) {
                    deleteMessage.textContent = `Are you sure you want to delete this student?`;
                    deleteModal.style.display = "block";

                    if (confirmDelete) {
                        confirmDelete.onclick = async () => {
                            const formData = new FormData();
                            formData.append("id", id);
                            const response = await fetch("students.php?action=deleteStudent", {
                                method: "POST",
                                body: formData,
                                credentials: 'same-origin'
                            });
                            const result = await response.json();

                            if (result.success) {
                                paginateTable();
                            } else {
                                alert(result.error || 'Failed to delete student');
                            }
                            if (deleteModal) deleteModal.style.display = "none";
                        };
                    }

                    if (cancelDelete) {
                        cancelDelete.onclick = () => {
                            if (deleteModal) deleteModal.style.display = "none";
                        };
                    }
                }
            });
        });

        document.querySelectorAll(".edit").forEach(button => {
            button.addEventListener("click", function () {
                const id = this.dataset.id;
                const student = Array.from(tableBody.querySelectorAll('tr')).find(row => {
                    return row.querySelector('.edit').dataset.id === id;
                });
                if (student) {
                    const studentData = {
                        id: id,
                        party: student.cells[1].textContent === 'N/A' ? '' : student.cells[1].textContent,
                        name: student.cells[2].textContent === 'N/A' ? '' : student.cells[2].textContent,
                        gender: student.cells[3].textContent === 'N/A' ? '' : student.cells[3].textContent,
                        birthday: student.cells[4].textContent === 'N/A' ? '' : student.cells[4].textContent,
                        status: student.cells[5].textContent === 'Online' ? 1 : 0
                    };
                    openEditModal(id, studentData);
                }
            });
        });

        const selectAllCheckbox = document.querySelector("#select-all");
        const checkboxes = document.querySelectorAll(".student-checkbox");

        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener("change", function () {
                checkboxes.forEach(checkbox => {
                    if (checkbox) checkbox.checked = this.checked;
                });
            });
        }

        checkboxes.forEach(checkbox => {
            if (checkbox) {
                checkbox.addEventListener("change", () => {
                    if (!checkbox.checked) {
                        if (selectAllCheckbox) selectAllCheckbox.checked = false;
                    } else if (document.querySelectorAll(".student-checkbox:checked").length === checkboxes.length) {
                        if (selectAllCheckbox) selectAllCheckbox.checked = true;
                    }
                });
            }
        });
    }

    function renderPaginationControls(totalPages) {
        let paginationContainer = document.getElementById("pagination");
        if (!paginationContainer) return;
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
        } else {
            paginationContainer.innerHTML = `Page ${currentPage} of ${totalPages}`;
        }
    }

    const messages = document.querySelectorAll(".message");
    const notificationIndicator = document.querySelector(".notification-indicator");

    if (messages && notificationIndicator) {
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
    }

    paginateTable();
    window.openModal = openModal;
});