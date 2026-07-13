// =================================
// FCV Service Master
// logout.js
// =================================

function logoutAdmin() {

    const confirmLogout = confirm("Are you sure you want to logout?");

    if (!confirmLogout) {
        return;
    }

    // Remove Admin Login Data
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminPassword");
    localStorage.removeItem("adminLoggedIn");

    // Clear Session Data
    sessionStorage.clear();

    // Prevent going back to dashboard
    window.location.replace("index.html");

}