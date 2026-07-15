// ==========================================================================
// FCV Service Master
// logout.js - Secure Authentication Token Extinguisher
// ==========================================================================

function logoutAdmin(event) {
    // 1. Prevent default event bubble tracking to avoid sudden document reload loops
    if (event) {
        event.preventDefault();
    }

    // 2. Interactive user confirmation dialogue prompt
    const confirmLogout = confirm("Are you sure you want to log out from FCV Admin Panel?");
    if (!confirmLogout) {
        return; // Terminate action instantly if admin cancels
    }

    // 3. Clear all potential dashboard cache variations from storage clusters
    // Lowercase format parameters matching cross-page sync modules
    localStorage.removeItem("admin_name");
    localStorage.removeItem("admin_mobile");
    
    // Explicit safety flush for old key variables
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminPassword");
    localStorage.removeItem("adminLoggedIn");

    // 4. Absolute structural cache isolation wipe out
    localStorage.clear();
    sessionStorage.clear();

    // 5. Hard bounce relocation router (Wipes dashboard views from browser back-button history)
    window.location.replace("admin-login.html");
}