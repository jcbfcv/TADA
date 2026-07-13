// ================================
// FCV Service Master
// admin-dashboard.js
// ================================

// Admin Name
const adminName = localStorage.getItem("adminName") || "Admin";
document.getElementById("adminName").textContent = adminName;


// Dashboard Counts (Temporary)
document.getElementById("totalEngineers").textContent = 0;
document.getElementById("todayAttendance").textContent = 0;
document.getElementById("totalSelfies").textContent = 0;
document.getElementById("totalLocations").textContent = 0;


// Recent Attendance Table
const attendanceTable = document.getElementById("attendanceTable");

attendanceTable.innerHTML = `
<tr>
    <td colspan="4">No Attendance Records Found</td>
</tr>
`;


// Logout Function
function logoutAdmin() {

    const logout = confirm("Are you sure you want to logout?");

    if(logout){

        localStorage.removeItem("adminName");

        window.location.href = "admin-login.html";
    }

}