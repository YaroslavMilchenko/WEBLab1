document.addEventListener("DOMContentLoaded", function () {
    const burger = document.querySelector(".burger");
    const mobileMenu = document.getElementById("mobile-menu");
    const modal = document.getElementById("modal");
    const closeModal = document.querySelector(".close");
    const createBtn = document.querySelector(".create");
    const userInfo = document.querySelector(".user-info");
    const notificationIcon = document.querySelector(".notification-icon");
    const notificationIndicator = document.querySelector(".notification-indicator");
    const table = document.querySelector("table tbody");
    const rowsPerPage = 10;
    let currentPage = 1;

    burger.addEventListener("click", function () {
        mobileMenu.classList.toggle("show");
    });

    notificationIcon.addEventListener("click", function () {
        notificationIndicator.style.display = "none";
        window.location.href = "messages.html";
    });

    function openModal() {
        modal.style.display = "block";
    }

    closeModal.addEventListener("click", function () {
        modal.style.display = "none";
    });

    createBtn.addEventListener("click", function (event) {
        event.preventDefault(); // 🛑 Prevent page reload

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

            const newRow = document.createElement("tr");
            newRow.innerHTML = `
                <td><input type="checkbox"></td>
                <td>${group}</td>
                <td>${name}</td>
                <td>M</td> 
                <td>${formattedBirthday}</td> 
                <td><span class="status online">Online</span></td>
                <td>
                    <button class="edit"><i class="fa-solid fa-pen"></i></button>
                    <button class="delete"><i class="fa-solid fa-x"></i></button>
                </td>
            `;

            table.appendChild(newRow);
            paginateTable();

            document.getElementById("student-name").value = "";
            document.getElementById("student-group").value = "";
            document.getElementById("student-birthday").value = "";

            modal.style.display = "none";
        }
    });

    window.openModal = openModal;

    mobileMenu.innerHTML = `
        <div class="mobile-user-info">
            <img src="user-avatar.jpg" alt="User Avatar" class="mobile-avatar">
            <span class="mobile-username">Username</span>
            <div class="notification-container">
                <i class="fa-solid fa-bell notification-icon"></i>
                <span class="notification-indicator"></span>
            </div>
        </div>
        <ul>
            <li><a href="main.html">Dashboard</a></li>
            <li><a href="students.html" class="active">Students</a></li>
            <li><a href="tasks.html">Tasks</a></li>
        </ul>
    `;

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

            document.body.appendChild(paginationContainer);
        }
    }

    paginateTable();
});
