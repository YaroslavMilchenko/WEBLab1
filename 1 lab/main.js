document.addEventListener("DOMContentLoaded", function () {
    const burger = document.querySelector(".burger");
    const mobileMenu = document.getElementById("mobile-menu");

    burger.addEventListener("click", function () {
        mobileMenu.classList.toggle("show");
    });
});

function toggleMenu() {
    document.getElementById("mobile-menu").classList.toggle("show");
}
