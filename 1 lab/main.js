document.addEventListener("DOMContentLoaded", function () {
    const burger = document.querySelector(".burger");
    const mobileMenu = document.getElementById("mobile-menu");
    const modal = document.getElementById("modal");
    const closeModal = document.querySelector(".close");
    const createBtn = document.querySelector(".create");
    const table = document.querySelector("table");
    const tableBody = document.querySelector("table tbody");
    const rowsPerPage = 10;
    let currentPage = 1;
    let students = [];

    burger.addEventListener("click", function () {
        mobileMenu.classList.toggle("show");
    });

    function openModal() {
        modal.style.display = "block";
    }

    closeModal.addEventListener("click", function () {
        modal.style.display = "none";
    });

    createBtn.addEventListener("click", function (event) {
        event.preventDefault();

        let name = document.getElementById("student-name").value;
        let group = document.getElementById("student-group").value;
        let birthday = document.getElementById("student-birthday").value;

        if (name === "" || group === "" || birthday === "") {
            alert("Fill all fields!");
        } else {
            let dateObj = new Date(birthday);
            let day = String(dateObj.getDate()).padStart(2, '0');
            let month = String(dateObj.getMonth() + 1).padStart(2, '0');
            let year = dateObj.getFullYear();
            let formattedBirthday = `${day}.${month}.${year}`;

            students.push({
                group,
                name,
                gender: "M", 
                birthday: formattedBirthday,
                status: "Online"
            });

            paginateTable();
            document.getElementById("student-name").value = "";
            document.getElementById("student-group").value = "";
            document.getElementById("student-birthday").value = "";
            modal.style.display = "none";
        }
    });

    function paginateTable() {
        const totalPages = Math.ceil(students.length / rowsPerPage);
        if (currentPage > totalPages) currentPage = totalPages || 1;

        tableBody.innerHTML = "";
        renderTableHeader();

        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        students.slice(start, end).forEach(student => {
            const newRow = document.createElement("tr");
            newRow.innerHTML = `
                <td><input type="checkbox"></td>
                <td>${student.group}</td>
                <td>${student.name}</td>
                <td>${student.gender}</td>
                <td>${student.birthday}</td>
                <td><span class="status online">${student.status}</span></td>
                <td>
                    <button class="edit"><i class="fa-solid fa-pen"></i></button>
                    <button class="delete"><i class="fa-solid fa-x"></i></button>
                </td>
            `;
            tableBody.appendChild(newRow);
        });

        renderPaginationControls(totalPages);
    }

    function renderTableHeader() {
        const headerRow = document.createElement("tr");
        headerRow.innerHTML = `
            <th><input type="checkbox"></th>
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
            nextButton.textContent = ">";
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
    }

    paginateTable();
    window.openModal = openModal;
});
