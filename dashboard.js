// =============================
// FCV Service Master Dashboard
// =============================

// Engineer Name
const engineer = localStorage.getItem("engineer") || "Engineer";
document.getElementById("engineerName").innerHTML = engineer;

// Elements
const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const photo = document.getElementById("photo");
const captureBtn = document.getElementById("captureBtn");

let selfieTaken = false;
let selfieSubmitted = false;

// Start Camera
navigator.mediaDevices.getUserMedia({
    video: {
        facingMode: "user"
    }
})
.then(function(stream){

    video.srcObject = stream;

})
.catch(function(){

    alert("Camera Permission Denied");

});

// Capture Selfie
captureBtn.addEventListener("click", function(){

    if(!selfieTaken){

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");

        ctx.drawImage(video,0,0);

        photo.src = canvas.toDataURL("image/png");

        // Camera Hide
        video.style.display = "none";

        // Selfie Show
        photo.style.display = "block";

        selfieTaken = true;

        captureBtn.innerHTML = "Submit Selfie";
        captureBtn.style.background = "#28a745";

        return;
    }

    // Submit Selfie
    if(!selfieSubmitted){

        selfieSubmitted = true;

        captureBtn.innerHTML = "✔ Selfie Submitted";

        captureBtn.style.background = "#6c757d";

        captureBtn.disabled = true;

        alert("Selfie Submitted Successfully");

    }

});
// =======================
// Retake Selfie
// =======================

const retakeBtn = document.createElement("button");

retakeBtn.innerHTML = "🔄 Retake Selfie";
retakeBtn.style.width = "100%";
retakeBtn.style.padding = "14px";
retakeBtn.style.marginTop = "10px";
retakeBtn.style.background = "#FF9800";
retakeBtn.style.color = "#fff";
retakeBtn.style.border = "none";
retakeBtn.style.borderRadius = "10px";
retakeBtn.style.fontSize = "16px";
retakeBtn.style.fontWeight = "bold";
retakeBtn.style.display = "none";

captureBtn.parentNode.appendChild(retakeBtn);

// Submit hone ke baad Retake button show karo
captureBtn.addEventListener("click", function () {

    if (selfieSubmitted) {
        retakeBtn.style.display = "block";
    }

});

// Retake Selfie
retakeBtn.addEventListener("click", function () {

    selfieTaken = false;
    selfieSubmitted = false;

    photo.style.display = "none";
    video.style.display = "block";

    captureBtn.disabled = false;
    captureBtn.innerHTML = "📷 Capture Selfie";
    captureBtn.style.background = "#2196F3";

    retakeBtn.style.display = "none";

});

// =======================
// Attendance History
// =======================

function openHistory() {

    window.location.href = "history.html";

}

// =======================
// Logout
// =======================

function logout() {

    if (confirm("Do you want to logout?")) {

        localStorage.clear();

        window.location.href = "index.html";

    }

}
// =========================
// Submit Animation & Save
// =========================

captureBtn.addEventListener("click", function () {

    if (selfieTaken && !selfieSubmitted) {

        captureBtn.innerHTML = "Submitting...";
        captureBtn.style.background = "#ff9800";
        captureBtn.disabled = true;

        setTimeout(function () {

            selfieSubmitted = true;

            localStorage.setItem("selfie", photo.src);
            localStorage.setItem("submitTime", new Date().toLocaleString());

            captureBtn.innerHTML = "✔ Selfie Submitted";
            captureBtn.style.background = "#4CAF50";

            retakeBtn.style.display = "block";

            alert("Selfie Submitted Successfully");

        }, 1500);

    }

});

// =========================
// Restore Submitted Selfie
// =========================

window.onload = function () {

    document.getElementById("engineerName").innerHTML =
        localStorage.getItem("engineer") || "Engineer";

    let savedSelfie = localStorage.getItem("selfie");

    if (savedSelfie) {

        photo.src = savedSelfie;
        photo.style.display = "block";

        video.style.display = "none";

        captureBtn.innerHTML = "✔ Selfie Submitted";
        captureBtn.style.background = "#4CAF50";
        captureBtn.disabled = true;

        retakeBtn.style.display = "block";

    }

};
// ===========================
// Current Date & Time
// ===========================

function updateDateTime() {

    const now = new Date();

    const options = {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    };

    localStorage.setItem(
        "attendanceDateTime",
        now.toLocaleString("en-IN", options)
    );

}

updateDateTime();


// ===========================
// Welcome Message
// ===========================

const hour = new Date().getHours();

let greeting = "Welcome";

if (hour < 12) {

    greeting = "Good Morning";

} else if (hour < 17) {

    greeting = "Good Afternoon";

} else {

    greeting = "Good Evening";

}

document.querySelector(".welcome h2").innerHTML =
greeting + ", " + engineer;


// ===========================
// Refresh Every Minute
// ===========================

setInterval(updateDateTime,60000);


// ===========================
// Console
// ===========================

console.log("FCV Service Master Loaded Successfully");
// ===============================
// Assigned Deputation Data
// ===============================

const deputation = {

    workshop: "On Site",

    callType: "U/W",

    engineerType: "Primary Engineer",

    customer: "Demo Customer",

    mobile: "9876543210",

    machine: "3609279",

    complaint: "Diesel Gauge Problem"

};

// Agar HTML me ye IDs hain to data show karo
if(document.getElementById("workshop"))
document.getElementById("workshop").innerHTML = deputation.workshop;

if(document.getElementById("callType"))
document.getElementById("callType").innerHTML = deputation.callType;

if(document.getElementById("engineerType"))
document.getElementById("engineerType").innerHTML = deputation.engineerType;

if(document.getElementById("customer"))
document.getElementById("customer").innerHTML = deputation.customer;

if(document.getElementById("mobile"))
document.getElementById("mobile").innerHTML = deputation.mobile;

if(document.getElementById("machine"))
document.getElementById("machine").innerHTML = deputation.machine;

if(document.getElementById("complaint"))
document.getElementById("complaint").innerHTML = deputation.complaint;