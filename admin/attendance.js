// =====================================
// FCV Service Master
// attendance.js
// =====================================

// Elements
const attendanceTable = document.getElementById("attendanceTable");

// Temporary Attendance Data
let attendanceData = [];

// Load Attendance
function loadAttendance(){

    if(attendanceData.length === 0){

        attendanceTable.innerHTML = `
        <tr>
            <td colspan="6">No Attendance Records Found</td>
        </tr>
        `;
        return;
    }

    attendanceTable.innerHTML = "";

    attendanceData.forEach(record => {

        attendanceTable.innerHTML += `
        <tr>

            <td>${record.engineer}</td>

            <td>${record.date}</td>

            <td>${record.time}</td>

            <td class="${record.status.toLowerCase()}">
                ${record.status}
            </td>

            <td>
                <button class="selfie-btn"
                onclick="viewSelfie('${record.selfie}')">
                View
                </button>
            </td>

            <td>
                <button class="location-btn"
                onclick="viewLocation('${record.location}')">
                View
                </button>
            </td>

        </tr>
        `;

    });

}

// Search
document.getElementById("searchInput").addEventListener("keyup", function(){

    const value = this.value.toLowerCase();

    const rows = document.querySelectorAll("#attendanceTable tr");

    rows.forEach(row => {

        row.style.display = row.innerText.toLowerCase().includes(value)
        ? ""
        : "none";

    });

});

// View Selfie
function viewSelfie(url){

    if(!url){

        alert("Selfie not available");
        return;

    }

    window.open(url,"_blank");

}

// View Location
function viewLocation(location){

    if(!location){

        alert("Location not available");
        return;

    }

    window.open(location,"_blank");

}

// Logout
function logoutAdmin(){

    if(confirm("Logout?")){

        window.location.href="admin-login.html";

    }

}

// First Load
loadAttendance();