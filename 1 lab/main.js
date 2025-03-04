document.addEventListener("DOMContentLoaded", function () {
    const burger = document.querySelector(".burger");
    const mobileMenu = document.getElementById("mobile-menu");
    const modal = document.getElementById("modal");
    const closeModal = document.querySelector(".close");
    const createBtn = document.querySelector(".create");

    burger.addEventListener("click", function () {
        mobileMenu.classList.toggle("show");
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
        event.preventDefault(); // 🛑 Остановка перезагрузки страницы

        let name = document.getElementById("student-name").value;
        let group = document.getElementById("student-group").value;
        let birthday = document.getElementById("student-birthday").value;

        if (name === "" || group === "" || birthday === "") {
            alert("Fill all fields!");
        } else {
            // Преобразование даты в формат ДД.ММ.ГГГГ
            let dateObj = new Date(birthday);
            let day = String(dateObj.getDate()).padStart(2, '0');
            let month = String(dateObj.getMonth() + 1).padStart(2, '0'); // +1, так как месяцы начинаются с 0
            let year = dateObj.getFullYear();
            let formattedBirthday = `${day}.${month}.${year}`;

            const table = document.querySelector("table");
            const newRow = table.insertRow(-1); // Добавляем строку в конец таблицы

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

            // Очистка полей ввода
            document.getElementById("student-name").value = "";
            document.getElementById("student-group").value = "";
            document.getElementById("student-birthday").value = "";

            modal.style.display = "none";
        }
    });

    window.openModal = openModal;
});
