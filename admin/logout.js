// ==========================================================================
// FCV Service Master - Secured Unique Logout Controller
// ==========================================================================

function secureLogoutEngine(event) {
    // 1. Stop early reloads
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    // 2. Clear focus/active triggers
    console.log("Secure logout engine sequence initialized...");

    // 3. Absolute confirmation check prompt box
    const userChoice = confirm("Are you sure you want to log out from FCV Admin Panel?");
    
    if (userChoice === true) {
        console.log("Executing session destruction...");
        
        // Clear everything safely
        localStorage.clear();
        sessionStorage.clear();
        
        // Permanent redirection history wipe
        window.location.replace("admin-login.html");
    } else {
        console.log("Logout aborted by system administrator.");
    }
}