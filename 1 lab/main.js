document.addEventListener("DOMContentLoaded", function () {
    const burger = document.querySelector(".burger");
    const mobileMenu = document.getElementById("mobile-menu");
    const modal = document.getElementById("modal");
    const closeModal = document.querySelector(".close");
    const createBtn = document.querySelector(".create");
    const table = document.querySelector("table tbody");
    const rowsPerPage = 10;
    let currentPage = 1;

    burger.addEventListener("click", function () {
        mobileMenu.classList.toggle("show");
    });

    function openModal() {
        modal.style.display = "block";
    }

    closeModal.addEventListener("click", function () {
        modal.style.display = "none";
    });

    function loadStudents() {
        fetch("load_students.php")
            .then(response => response.json())
            .then(data => {
                table.innerHTML = "";
                data.forEach(student => {
                    addStudentToTable(student);
                });
                paginateTable();
            })
            .catch(error => console.error("Error loading students:", error));
    }

    function addStudentToTable(student) {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td><input type="checkbox"></td>
            <td>${student.group}</td>
            <td>${student.name}</td>
            <td>${student.gender}</td>
            <td>${student.birthday}</td>
            <td><span class="status ${student.status === 'Online' ? 'online' : 'offline'}">${student.status}</span></td>
            <td>
                <button class="edit"><i class="fa-solid fa-pen"></i></button>
                <button class="delete"><i class="fa-solid fa-x"></i></button>
            </td>
        `;
        table.appendChild(newRow);
        attachRowEvents(newRow);
    }

    createBtn.addEventListener("click", function (event) {
        event.preventDefault();

        let name = document.getElementById("student-name").value;
        let group = document.getElementById("student-group").value;
        let birthday = document.getElementById("student-birthday").value;

        if (name === "" || group === "" || birthday === "") {
            alert("Fill all fields!");
            return;
        }

        let formData = new FormData();
        formData.append("name", name);
        formData.append("group", group);
        formData.append("birthday", birthday);

        fetch("add_student.php", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadStudents(); // Reload students after adding
            } else {
                console.error("Error adding student:", data.error);
            }
        });

        modal.style.display = "none";
    });

    function attachRowEvents(row) {
        row.querySelector(".delete").addEventListener("click", function () {
            row.remove();
            paginateTable();
        });

        row.querySelector(".edit").addEventListener("click", function () {
            const cells = row.children;
            document.getElementById("student-name").value = cells[2].textContent;
            document.getElementById("student-group").value = cells[1].textContent;
            document.getElementById("student-birthday").value = cells[4].textContent.split(".").reverse().join("-");
            modal.style.display = "block";

            createBtn.onclick = function (event) {
                event.preventDefault();
                cells[2].textContent = document.getElementById("student-name").value;
                cells[1].textContent = document.getElementById("student-group").value;
                let newBirthday = document.getElementById("student-birthday").value.split("-").reverse().join(".");
                cells[4].textContent = newBirthday;
                modal.style.display = "none";
                createBtn.onclick = createStudent;
            };
        });
    }

    function paginateTable() {
        const rows = Array.from(table.children);
        const totalPages = Math.ceil(rows.length / rowsPerPage);
        table.innerHTML = "";
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        rows.slice(start, end).forEach(row => table.appendChild(row));

        const paginationContainer = document.getElementById("pagination") || document.createElement("div");
        paginationContainer.id = "pagination";
        paginationContainer.innerHTML = "";
        paginationContainer.style.textAlign = "center";
        paginationContainer.style.marginTop = "10px";

        if (totalPages > 1) {
            const prevButton = document.createElement("button");
            prevButton.textContent = "←";
            prevButton.classList.add("page-btn");
            prevButton.disabled = currentPage === 1;
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
                if (i === currentPage) pageButton.classList.add("active");
                pageButton.addEventListener("click", function () {
                    currentPage = i;
                    paginateTable();
                });
                paginationContainer.appendChild(pageButton);
            }

            const nextButton = document.createElement("button");
            nextButton.textContent = "→";
            nextButton.classList.add("page-btn");
            nextButton.disabled = currentPage === totalPages;
            nextButton.addEventListener("click", function () {
                if (currentPage < totalPages) {
                    currentPage++;
                    paginateTable();
                }
            });
            paginationContainer.appendChild(nextButton);
        }

        document.body.appendChild(paginationContainer);
    }

    loadStudents();
});
