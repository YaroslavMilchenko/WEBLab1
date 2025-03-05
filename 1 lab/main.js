document.addEventListener("DOMContentLoaded", function () {
    const burger = document.querySelector(".burger");
    const mobileMenu = document.createElement("nav");
    mobileMenu.id = "mobile-menu";
    mobileMenu.innerHTML = `
        <ul>
            <li><a href="main.html">Dashboard</a></li>
            <li><a href="students.html" class="active">Students</a></li>
            <li><a href="tasks.html">Tasks</a></li>
        </ul>
    `;
    document.body.appendChild(mobileMenu);
    
    const modal = document.getElementById("modal");
    const closeModal = document.querySelector(".close");
    const createBtn = document.querySelector(".create");
    const userInfo = document.querySelector(".user-info");
    
    burger.addEventListener("click", function () {
        mobileMenu.classList.toggle("show");
        if (mobileMenu.classList.contains("show")) {
            mobileMenu.prepend(userInfo);
        } else {
            document.querySelector("#header-nav").appendChild(userInfo);
        }
    });

    document.querySelector(".notification-icon").addEventListener("click", function () {
        document.querySelector(".notification-indicator").style.display = "none";
        window.location.href = "messages.html";
    });

    function openModal() {
        modal.style.display = "block";
    }

    closeModal.addEventListener("click", function () {
        modal.style.display = "none";
    });

    createBtn.addEventListener("click", function (event) {
        event.preventDefault(); // 🛑 Prevent page refresh

        let name = document.getElementById("student-name").value;
        let group = document.getElementById("student-group").value;
        let birthday = document.getElementById("student-birthday").value;

        if (name === "" || group === "" || birthday === "") {
            alert("Fill all fields!");
        } else {
            // Convert date to DD.MM.YYYY format
            let dateObj = new Date(birthday);
            let day = String(dateObj.getDate()).padStart(2, '0');
            let month = String(dateObj.getMonth() + 1).padStart(2, '0');
            let year = dateObj.getFullYear();
            let formattedBirthday = `${day}.${month}.${year}`;

            const table = document.querySelector("table");
            const newRow = table.insertRow(-1);

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

            // Clear input fields
            document.getElementById("student-name").value = "";
            document.getElementById("student-group").value = "";
            document.getElementById("student-birthday").value = "";

            modal.style.display = "none";
        }
    });

    window.openModal = openModal;
});
