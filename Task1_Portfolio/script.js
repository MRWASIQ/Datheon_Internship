var menuToggle = document.getElementById("menuToggle");
var navLinks = document.getElementById("navLinks");
var themeToggle = document.getElementById("themeToggle");
var projectModal = document.getElementById("projectModal");
var modalTitle = document.getElementById("modalTitle");
var modalDescription = document.getElementById("modalDescription");
var modalClose = document.getElementById("modalClose");

menuToggle.addEventListener("click", function () {
    navLinks.classList.toggle("active");
});

var navigationLinks = document.querySelectorAll(".nav-links a");

navigationLinks.forEach(function (link) {
    link.addEventListener("click", function () {
        navLinks.classList.remove("active");
    });
});

themeToggle.addEventListener("click", function () {

    document.body.classList.toggle("light-theme");

    if (document.body.classList.contains("light-theme")) {
        themeToggle.textContent = "☾";
        localStorage.setItem("portfolioTheme", "light");
    } else {
        themeToggle.textContent = "☀";
        localStorage.setItem("portfolioTheme", "dark");
    }

});

var savedTheme = localStorage.getItem("portfolioTheme");

if (savedTheme === "light") {
    document.body.classList.add("light-theme");
    themeToggle.textContent = "☾";
}

var projectButtons = document.querySelectorAll(".project-link");

projectButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        modalTitle.textContent = button.getAttribute("data-title");

        modalDescription.textContent = button.getAttribute("data-description");

        projectModal.classList.add("active");

    });

});

modalClose.addEventListener("click", function () {
    projectModal.classList.remove("active");
});

projectModal.addEventListener("click", function (event) {

    if (event.target === projectModal) {
        projectModal.classList.remove("active");
    }

});

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {
        projectModal.classList.remove("active");
    }

});

document.getElementById("currentYear").textContent =
    new Date().getFullYear();
