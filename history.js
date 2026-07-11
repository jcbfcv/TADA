// ===============================
// FCV Service Master
// history.js
// ===============================

// Page Load
window.onload = function () {

    // Engineer Name
    document.getElementById("eng").innerHTML =
        localStorage.getItem("engineer") || "-";

    // Current Date
    document.getElementById("date").innerHTML =
        new Date().toLocaleDateString("en-IN");

    // Selfie Submit Time
    document.getElementById("submitTime").innerHTML =
        localStorage.getItem("submitTime") || "Not Submitted";

    // Deputation Details
    document.getElementById("workshop").innerHTML =
        localStorage.getItem("workshop") || "On Site";

    document.getElementById("customer").innerHTML =
        localStorage.getItem("customer") || "Demo Customer";

    document.getElementById("machine").innerHTML =
        localStorage.getItem("machine") || "3609279";

    document.getElementById("complaint").innerHTML =
        localStorage.getItem("complaint") || "Diesel Gauge Problem";

};

// ===============================
// Search Attendance
// ===============================

function searchAttendance() {

    let from = document.getElementById("fromDate").value;
    let to = document.getElementById("toDate").value;

    if (from === "" || to === "") {

        alert("Please select From Date and To Date.");
        return;

    }

    alert(
        "Searching Attendance\n\nFrom : " +
        from +
        "\nTo : " +
        to
    );

    // Google Sheet connect hone ke baad
    // yahin search result show hoga.

}

// ===============================
// Back Button
// ===============================

function goBack() {

    window.location.href = "dashboard.html";

}

// ===============================
// Refresh Attendance
// ===============================

function refreshAttendance() {

    location.reload();

}

console.log("Attendance History Loaded Successfully");