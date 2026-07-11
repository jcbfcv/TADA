// =============================
// Supabase Configuration
// =============================
const supabaseUrl = 'https://ludsxcigohoyriplccfm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1ZHN4Y2lnb2hveXJpcGxjY2ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3NDQ2OTgsImV4cCI6MjA5OTMyMDY5OH0.rCiu1XfIEXTnFptbMgFeaLIrXLqGUZZJN8yuhy4lGkE';

// Initialize the client using the globally exposed window.supabase library object
const dbClient = supabase.createClient(supabaseUrl, supabaseKey);

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
const alertModal = document.getElementById("customAlertModal");

// Status Box DOM Elements
const statusTitle = document.getElementById("statusTitle");
const statusMessage = document.getElementById("statusMessage");
const dailyCountText = document.getElementById("dailyCountText");

let selfieTaken = false;
let selfieSubmitted = false;

// Dynamically generate the Retake Selfie Button
const retakeBtn = document.createElement("button");
retakeBtn.innerHTML = "🔄 Retake Photo";
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

// Start Camera
function startCamera() {
    navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false
    })
    .then(function(stream){
        video.srcObject = stream;
        video.style.display = "block";
        photo.style.display = "none";
    })
    .catch(function(){
        showCustomAlert("Error", "Camera Permission Denied");
    });
}

// Automatically start camera on load
startCamera();

// ==========================================
// Fetch Real-time Daily Count from Database
// ==========================================
async function updateDailySubmissionCount() {
    try {
        const todayStart = new Date();
        todayStart.setHours(0,0,0,0);
        
        const todayEnd = new Date();
        todayEnd.setHours(23,59,59,999);

        // Fetch count of entries for current engineer submitted today
        const { count, error } = await dbClient
            .from('attendance_logs')
            .select('*', { count: 'exact', head: true })
            .eq('engineer_name', engineer)
            .gte('submitted_at', todayStart.toISOString())
            .lte('submitted_at', todayEnd.toISOString());

        if (error) throw error;
        
        if (dailyCountText) {
            dailyCountText.innerText = `${count} submission(s) today`;
        }
    } catch (err) {
        console.error("Failed to fetch daily count:", err.message);
        if (dailyCountText) {
            dailyCountText.innerText = "0 submissions today";
        }
    }
}

// ==========================================
// Capture & Submission Main Workflow Hook
// ==========================================
captureBtn.addEventListener("click", function(){
    
    // STEP 1: Take the photo snapshot
    if(!selfieTaken){
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        photo.src = canvas.toDataURL("image/png");
        video.style.display = "none";
        photo.style.display = "block";
        
        selfieTaken = true;
        captureBtn.innerHTML = "Submit Photo & Location";
        captureBtn.style.background = "#28a745";
        return;
    }

    // STEP 2: Process Geolocation Tracking and upload data to Supabase
    if (selfieTaken && !selfieSubmitted) {
        
        // Instantly transition UI to uploading/disabled state
        captureBtn.innerHTML = "Submitting...";
        captureBtn.style.background = "#ff9800";
        captureBtn.style.opacity = "0.5";
        captureBtn.style.cursor = "not-allowed";
        captureBtn.disabled = true;

        // Fallback gracefully if browser has zero support for geolocation hardware
        if (!navigator.geolocation) {
            console.warn("Geolocation hardware missing. Submitting with default coordinates.");
            sendDataToDatabase(photo.src, 0, 0);
            return;
        }

        // Query live hardware sensors (optimized for laptops/browsers)
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                sendDataToDatabase(photo.src, lat, lng);
            },
            function(error) {
                console.warn("Geolocation skipped or timed out (" + error.message + "). Proceeding with upload.");
                sendDataToDatabase(photo.src, 0, 0);
            },
            { 
                enableHighAccuracy: false, 
                timeout: 15000, 
                maximumAge: 60000 
            }
        );
    }
});

// ==========================================
// Database Async Push Pipeline
// ==========================================
async function sendDataToDatabase(base64Image, latitude, longitude) {
    try {
        const fileName = `selfie_${Date.now()}.png`;
        
        // Convert the base64 URI into a binary blob stream
        const base64Response = await fetch(base64Image);
        const blob = await base64Response.blob();

        // 1. Storage Bucket upload
        const { data: uploadData, error: uploadError } = await dbClient.storage
            .from('selfies')
            .upload(fileName, blob, { contentType: 'image/png' });

        if (uploadError) throw uploadError;

        // 2. Extract public image asset target path
        const { data: urlData } = dbClient.storage
            .from('selfies')
            .getPublicUrl(fileName);
            
        const finalImageUrl = urlData.publicUrl;

        // 3. Document new entry inside relation log rows
        const { error: dbError } = await dbClient
            .from('attendance_logs')
            .insert([
                { 
                    engineer_name: engineer, 
                    latitude: latitude, 
                    longitude: longitude, 
                    image_url: finalImageUrl 
                }
            ]);

        if (dbError) throw dbError;

        // Commit local application states
        selfieSubmitted = true;
        localStorage.setItem("selfie", photo.src);
        localStorage.setItem("submitTime", new Date().toLocaleString());

        // Update Submission Button to final faded signature state
        captureBtn.innerHTML = "✔ Selfie Submitted";
        captureBtn.style.background = "#4CAF50";
        captureBtn.style.opacity = "0.5";
        captureBtn.style.cursor = "not-allowed";
        captureBtn.disabled = true;
        retakeBtn.style.display = "block";

        // Update Green Status Box details instantly
        if (statusTitle) statusTitle.innerText = "Submission Verified!";
        if (statusMessage) statusMessage.innerText = "Photo and GPS data uploaded successfully.";
        
        // Recalculate counter immediately following database modification
        updateDailySubmissionCount();

        showCustomAlert("Success!", "Attendance and location registered successfully.");

    } catch (error) {
        console.error("Database Save Failed:", error.message);
        showCustomAlert("Upload Error", "Failed to save submission to the database. Please try again.");
        resetCaptureButton();
    }
}

// Retake Logic Action Hook
retakeBtn.addEventListener("click", function () {
    selfieTaken = false;
    selfieSubmitted = false;
    
    photo.style.display = "none";
    video.style.display = "block";
    
    captureBtn.disabled = false;
    captureBtn.style.opacity = "1"; 
    captureBtn.style.cursor = "pointer";
    captureBtn.innerHTML = "📷 Capture Photo";
    captureBtn.style.background = "#2196F3";
    
    retakeBtn.style.display = "none";

    // Reset Status Alert Box elements back to ready state
    if (statusTitle) statusTitle.innerText = "Status: Active";
    if (statusMessage) statusMessage.innerText = "Ready for attendance check-in.";

    startCamera();
});

// =========================
// Modal Helper Functions
// =========================
function showCustomAlert(title, message) {
    document.getElementById("modalTitle").innerText = title;
    document.getElementById("modalMessage").innerText = message;
    
    if (title.toLowerCase().includes("error")) {
        document.getElementById("modalTitle").style.color = "#d32f2f";
    } else {
        document.getElementById("modalTitle").style.color = "#28a745";
    }
    alertModal.style.display = "flex";
}

document.getElementById("modalCloseBtn").addEventListener("click", function() {
    alertModal.style.display = "none";
});

function resetCaptureButton() {
    captureBtn.disabled = false;
    captureBtn.style.opacity = "1";
    captureBtn.style.cursor = "pointer";
    captureBtn.innerHTML = "Submit Photo & Location";
    captureBtn.style.background = "#28a745";
}

// Attendance History Router
function openHistory() {
    window.location.href = "history.html";
}

// Logout Utility
function logout() {
    if (confirm("Do you want to logout?")) {
        localStorage.clear();
        window.location.href = "index.html";
    }
}

// ==========================================
// Date, Time, and Welcome Init Configurations
// ==========================================
function updateDateTime() {
    const now = new Date();
    const options = { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" };
    localStorage.setItem("attendanceDateTime", now.toLocaleString("en-IN", options));
}
updateDateTime();
setInterval(updateDateTime, 60000);

const hour = new Date().getHours();
let greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
document.querySelector(".welcome h2").innerHTML = greeting + ", " + engineer;

// Restore Submitted state on layout reloads
window.onload = function () {
    // Fire off the counter calculation loop on start
    updateDailySubmissionCount();

    let savedSelfie = localStorage.getItem("selfie");
    if (savedSelfie) {
        photo.src = savedSelfie;
        photo.style.display = "block";
        video.style.display = "none";
        
        selfieTaken = true;
        selfieSubmitted = true;
        captureBtn.innerHTML = "✔ Selfie Submitted";
        captureBtn.style.background = "#4CAF50";
        captureBtn.style.opacity = "0.5";
        captureBtn.disabled = true;
        retakeBtn.style.display = "block";

        // Retain verified layout text message signatures across reloads
        if (statusTitle) statusTitle.innerText = "Submission Verified!";
        if (statusMessage) statusMessage.innerText = "Photo and GPS data uploaded successfully.";
    }
};

console.log("FCV Service Master Loaded Successfully");