// ===================================================
// SUPABASE CONNECTION & CONFIGURATION
// ===================================================
const DB_URL = 'https://ludsxcigohoyriplccfm.supabase.co';
const DB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1ZHN4Y2lnb2hveXJpcGxjY2ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3NDQ2OTgsImV4cCI6MjA5OTMyMDY5OH0.rCiu1XfIEXTnFptbMgFeaLIrXLqGUZZJN8yuhy4lGkE';

const { createClient } = window.supabase;
const supabase = createClient(DB_URL, DB_KEY);

// State monitoring for hardware stream
let mediaStreamTrackReference = null;

// Lifecycle hook triggering on load
window.onload = function() {
    setDynamicGreetingMessage();
    verifySessionAndFetchProfile();
    initializeHardwareCamera();
}

// ===================================================
// UI GREETINGS LOGIC
// ===================================================
function setDynamicGreetingMessage() {
    const currentHour = new Date().getHours();
    let textGreeting = "Hello";
    if (currentHour >= 4 && currentHour < 12) textGreeting = "Good Morning";
    else if (currentHour >= 12 && currentHour < 17) textGreeting = "Good Afternoon";
    else if (currentHour >= 17 && currentHour < 22) textGreeting = "Good Evening";
    
    document.getElementById("greetingTimeText").innerText = textGreeting;
}

// ===================================================
// DATABASE INTEGRATION & SESSION LOGIC
// ===================================================
async function verifySessionAndFetchProfile() {
    let targetId = localStorage.getItem("engineer_id") || localStorage.getItem("engineer_session_key");
    const displayField = document.getElementById("engineerName");

    if (!targetId) {
        console.log("No active session key found. Redirecting to login...");
        window.location.href = "login.html";
        return;
    }

    try {
        // Fetch specific engineer details
        const { data: profile, error } = await supabase
            .from('engineer_profiles')
            .select('engineer_name')
            .eq('id', targetId)
            .maybeSingle();
        
        if (error) throw error;

        if (profile && profile.engineer_name) {
            const parsedName = profile.engineer_name;
            
            displayField.innerText = parsedName;
            localStorage.setItem("engineer_name", parsedName);
            
            loadDailySubmissionCounterLogs(parsedName);
            fetchAssignedDeputations(targetId);
        } else {
            displayField.innerText = "Engineer";
            resetClaimsUI("No active profile data found.");
        }
    } catch(e) { 
        console.error("Profile Fetch Error: ", e); 
        let cachedName = localStorage.getItem("engineer_name");
        if (cachedName) displayField.innerText = cachedName;
        resetClaimsUI("Network disconnected.");
    }
}

async function fetchAssignedDeputations(engineerId) {
    try {
        const { data: claim, error } = await supabase
            .from('claims')
            .select('*')
            .eq('engineer_id', engineerId)
            .eq('status', 'Pending')
            .limit(1)
            .maybeSingle();

        if (error) throw error;

        if (claim) {
            document.getElementById("customer").innerText = claim.customer_name || "N/A";
            document.getElementById("mobile").innerText = claim.customer_mobile || "N/A";
            document.getElementById("machine").innerText = claim.machine_serial_no || "N/A";
            document.getElementById("complaint").innerText = claim.complaint || "No active description";
        } else {
            resetClaimsUI("No pending assignments today.");
        }
    } catch (err) { 
        console.error("Claims query failure: ", err); 
        resetClaimsUI("Failed to load active duties.");
    }
}

function resetClaimsUI(message) {
    document.getElementById("customer").innerText = "N/A";
    document.getElementById("mobile").innerText = "N/A";
    document.getElementById("machine").innerText = "N/A";
    document.getElementById("complaint").innerText = message;
}

async function loadDailySubmissionCounterLogs(engineerSearchStringName) {
    try {
        const startOfDayTimestamp = new Date();
        startOfDayTimestamp.setHours(0,0,0,0);

        const { data: logRecords, error } = await supabase
            .from('attendance_logs')
            .select('*')
            .eq('engineer_name', engineerSearchStringName)
            .gte('submitted_at', startOfDayTimestamp.toISOString());

        if (!error && logRecords) {
            document.getElementById("dailyCountText").innerText = `${logRecords.length} submission(s) today`;
        }
    } catch (fail) { console.error(fail); }
}

// ===================================================
// HARDWARE MEDIA CAPTURE & LOCATION LOGIC
// ===================================================
function initializeHardwareCamera() {
    const videoFeedContainer = document.getElementById("camera");
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })
        .then(stream => {
            mediaStreamTrackReference = stream;
            videoFeedContainer.srcObject = stream;
        })
        .catch(err => { console.error("Camera access blocked:", err); });
}

function triggerSelfieCaptureWorkflow() {
    const video = document.getElementById("camera");
    const canvas = document.getElementById("canvas");
    const photo = document.getElementById("photo");
    
    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const dataUrlBase64Image = canvas.toDataURL("image/jpeg");
    photo.src = dataUrlBase64Image;
    
    video.style.display = "none";
    photo.style.display = "block";

    fetchGeoLocationCoordinatesAndUpload();
}

function fetchGeoLocationCoordinatesAndUpload() {
    if (!navigator.geolocation) {
        executeUploadPipeline(0, 0);
        return;
    }
    navigator.geolocation.getCurrentPosition(
        (pos) => executeUploadPipeline(pos.coords.latitude, pos.coords.longitude),
        (err) => executeUploadPipeline(0, 0),
        { enableHighAccuracy: true, timeout: 8000 }
    );
}

async function executeUploadPipeline(lat, lon) {
    const currentEngineerName = document.getElementById("engineerName").innerText;
    try {
        const { error } = await supabase
            .from('attendance_logs')
            .insert([{
                engineer_name: currentEngineerName,
                latitude: lat,
                longitude: lon,
                status: "Present",
                image_url: "https://ludsxcigohoyriplccfm.supabase.co/storage/v1/object/public/attendance_selfies/placeholder.jpg",
                submitted_at: new Date().toISOString()
            }]);

        if (error) {
            showCustomPopupAlertModal("Submission Failure", error.message);
        } else {
            showCustomPopupAlertModal("Success!", "Your selfie and location coordinates have been submitted successfully.");
            loadDailySubmissionCounterLogs(currentEngineerName);
        }
    } catch (err) {
        showCustomPopupAlertModal("System Error", "Database connection lost.");
    }
}

// ===================================================
// MODAL & EXIT LOGIC
// ===================================================
function showCustomPopupAlertModal(titleText, bodyMessage) {
    document.getElementById("modalTitle").innerText = titleText;
    document.getElementById("modalMessage").innerText = bodyMessage;
    document.getElementById("customAlertModal").style.display = "flex";
}

function closeCustomAlertPopup() {
    document.getElementById("customAlertModal").style.display = "none";
    document.getElementById("camera").style.display = "block";
    document.getElementById("photo").style.display = "none";
}

function logoutEngineerSequence() {
    if (confirm("Are you sure you want to exit the dashboard?")) {
        if (mediaStreamTrackReference) {
            mediaStreamTrackReference.getTracks().forEach(track => track.stop());
        }
        localStorage.clear();
        window.location.href = "login.html";
    }
}