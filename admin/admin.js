// ==============================
// Show / Hide Password
// ==============================

const togglePassword = document.getElementById("togglePassword");
const password = document.getElementById("password");

togglePassword.addEventListener("click", function () {

    if (password.type === "password") {
        password.type = "text";
        togglePassword.innerHTML = "🙈";
    } else {
        password.type = "password";
        togglePassword.innerHTML = "👁";
    }

});


// ==============================
// Admin Login
// ==============================

function adminLogin() {

    const username = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();

    if (username === "" || pass === "") {

        alert("Please enter Username and Password.");
        return;

    }

    // Temporary Login
    if (username === "admin" && pass === "admin123") {

        localStorage.setItem("admin", username);

        alert("Login Successful");

        window.location.href = "admin-dashboard.html";

    }

    else {

        alert("Invalid Username or Password");

    }

}


// ==============================
// Enter Key Login
// ==============================

document.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {

        adminLogin();

    }

});