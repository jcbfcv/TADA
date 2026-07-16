// ===================================================
// FCV SERVICE MASTER ENGINE - DASHBOARD MODULE
// ===================================================

(function () {
    // Isolated client initializations
    const DB_URL = 'https://ludsxcigohoyriplccfm.supabase.co';
    const DB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1ZHN4Y2lnb2hveXJpcGxjY2ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3NDQ2OTgsImV4cCI6MjA5OTMyMDY5OH0.rCiu1XfIEXTnFptbMgFeaLIrXLqGUZZJN8yuhy4lGkE';

    const supabase = window.supabase.createClient(DB_URL, DB_KEY);
    let mediaStreamTrackReference = null;
    let currentWorkflowState = "CAPTURE"; // Tracks: CAPTURE, SUBMIT, DONE
    let base64CapturedImageCache = null;

    // Window global triggers attachment engine
    window.onload = function() {
        setDynamicGreetingMessage();
        verifySessionAndFetchProfile();
        initializeHardwareCamera();
    };

    // UI Greetings dynamic logic mapping
    function setDynamicGreetingMessage() {
        const currentHour = new Date().getHours();
        let textGreeting = "Hello";
        if (currentHour >= 4 && currentHour < 12) textGreeting = "Good Morning";
        else if (currentHour >= 12 && currentHour < 17) textGreeting = "Good Afternoon";
        else if (currentHour >= 17 && currentHour < 22) textGreeting = "Good Evening";
        
        document.getElementById("greetingTimeText").innerText = textGreeting;
    }

    // Session validation core pipeline
    async function verifySessionAndFetchProfile() {
        let targetId = localStorage.getItem("engineer_id") || localStorage.getItem("engineer_session_key");
        const displayField = document.getElementById("engineerName");

        if (!targetId) {
            console.log("No active session key found. Redirecting to login...");
            window.location.href = "index.html";
            return;
        }

        try {
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
                // engineer_name pass kar rahe hain complaints se map karne ke liye
                fetchAssignedComplaints(parsedName); 
            } else {
                displayField.innerText = "Engineer";
                resetComplaintsUI("No active profile data found.");
            }
        } catch(e) { 
            console.error("Profile Fetch Error: ", e); 
            let cachedName = localStorage.getItem("engineer_name");
            if (cachedName) displayField.innerText = cachedName;
            resetComplaintsUI("Network disconnected.");
        }
    }

    // UPDATED: Fetches data directly from the 'complaints' table filtered by engineer_name
    async function fetchAssignedComplaints(engineerName) {
        try {
            console.log(`Connecting Database for Engineer: ${engineerName}`);
            
            const { data: activeComplaint, error } = await supabase
                .from('complaints')
                .select('*')
                .eq('engineer_name', engineerName) // Logged-in engineer ke specific data filter ke liye
                .order('id', { ascending: false })  // Sabse latest update pehle dikhane ke liye
                .limit(1)
                .maybeSingle();

            if (error) throw error;

            if (activeComplaint) {
                // UI Elements mapping dynamically with complaints table schema
                document.getElementById("workshop").innerText = activeComplaint.workshop_onsite || "On Site";
                document.getElementById("callType").innerText = activeComplaint.call_type || "U/W";
                document.getElementById("engineerType").innerText = activeComplaint.primary_secondary_engineer || "Primary Engineer";
                
                document.getElementById("customer").innerText = activeComplaint.customer_name || "N/A";
                document.getElementById("mobile").innerText = activeComplaint.contact_number || "N/A";
                document.getElementById("machine").innerText = activeComplaint.machine_no || "N/A";
                
                document.getElementById("complaint").innerText = activeComplaint.complaint || "No active description";
            } else {
                resetComplaintsUI("No pending assignments today.");
            }
        } catch (err) { 
            console.error("Complaints table query failure: ", err); 
            resetComplaintsUI("Failed to load active duties.");
        }
    }

    function resetComplaintsUI(message) {
        document.getElementById("workshop").innerText = "N/A";
        document.getElementById("callType").innerText = "N/A";
        document.getElementById("engineerType").innerText = "N/A";
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

    // Camera initialisation sequences
    function initializeHardwareCamera() {
        const videoFeedContainer = document.getElementById("camera");
        
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, 
                audio: false 
            })
            .then(stream => {
                mediaStreamTrackReference = stream;
                videoFeedContainer.srcObject = stream;
            })
            .catch(err => { 
                console.error("Camera access blocked or device not found:", err);
                alert("Camera Permission Required! Please allow camera access in your browser settings.");
            });
        } else {
            alert("Your browser does not support native camera media stream capture elements.");
        }
    }

    // Single Routing Coordinator for Main Action Button
    function handleDashboardWorkflowClick() {
        if (currentWorkflowState === "CAPTURE") {
            executePhotoSnapState();
        } else if (currentWorkflowState === "SUBMIT") {
            fetchGeoLocationCoordinatesAndUpload();
        }
    }

    // STATE 1: Capture Photo and show Preview
    function executePhotoSnapState() {
        const video = document.getElementById("camera");
        const canvas = document.getElementById("canvas");
        const photo = document.getElementById("photo");
        const mainBtn = document.getElementById("captureBtn");
        const retakeBox = document.getElementById("retakeContainer");

        if (!mediaStreamTrackReference) {
            alert("Camera stream is not active. Cannot capture photo.");
            return;
        }

        const context = canvas.getContext("2d");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        base64CapturedImageCache = canvas.toDataURL("image/jpeg");
        photo.src = base64CapturedImageCache;
        
        // UI Views Switching
        video.style.display = "none";
        photo.style.display = "block";
        if (retakeBox) retakeBox.style.display = "block";

        // Shift button state to Submit
        mainBtn.innerText = "🚀 Submit Photo & Location";
        mainBtn.style.background = "#28a745"; 
        currentWorkflowState = "SUBMIT";
    }

    // STATE 2: Reset Back to Camera Mode (Retake functionality loop)
    function resetToCameraMode() {
        const video = document.getElementById("camera");
        const photo = document.getElementById("photo");
        const mainBtn = document.getElementById("captureBtn");
        const retakeBox = document.getElementById("retakeContainer");

        video.style.display = "block";
        photo.style.display = "none";
        if (retakeBox) retakeBox.style.display = "none";

        // Reset Main Trigger Elements State
        mainBtn.innerText = "📷 Capture Photo";
        mainBtn.style.background = "#2196F3"; 
        mainBtn.disabled = false;
        mainBtn.style.opacity = "1";
        mainBtn.style.cursor = "pointer";
        
        base64CapturedImageCache = null;
        currentWorkflowState = "CAPTURE";
    }

    function fetchGeoLocationCoordinatesAndUpload() {
        const mainBtn = document.getElementById("captureBtn");
        mainBtn.innerText = "⏳ Processing Upload...";
        mainBtn.disabled = true;

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

    // STATE 3: Finalized Data Upload Execution
    async function executeUploadPipeline(lat, lon) {
        const currentEngineerId = localStorage.getItem("engineer_id") || localStorage.getItem("engineer_session_key");
        const currentEngineerName = localStorage.getItem("engineer_name") || "Unknown Engineer";
        const mainBtn = document.getElementById("captureBtn");
        const retakeBox = document.getElementById("retakeContainer");

        if (!currentEngineerId) {
            showCustomPopupAlertModal("Session Error", "Active profile identity missing. Please re-login.");
            window.location.href = "index.html";
            return;
        }

        try {
            const { error } = await supabase
                .from('attendance_logs')
                .insert([{
                    engineer_id: currentEngineerId,      // Relational dynamic UUID Link
                    engineer_name: currentEngineerName,  // Fallback explicit tracking string
                    latitude: lat,
                    longitude: lon,
                    image_url: base64CapturedImageCache || "https://ludsxcigohoyriplccfm.supabase.co/storage/v1/object/public/attendance_selfies/placeholder.jpg",
                    submitted_at: new Date().toISOString()
                }]);

            if (error) {
                showCustomPopupAlertModal("Submission Failure", error.message);
                mainBtn.innerText = "🚀 Submit Photo & Location";
                mainBtn.disabled = false;
            } else {
                showCustomPopupAlertModal("Success!", "Your photo and location coordinates have been submitted successfully.");
                
                // Final freezing state updates
                mainBtn.innerText = "✅ Submitted";
                mainBtn.style.background = "#6c757d"; 
                mainBtn.style.opacity = "0.6"; 
                mainBtn.style.cursor = "not-allowed";
                mainBtn.disabled = true;
                
                if (retakeBox) retakeBox.style.display = "none"; // Final lock achieved
                currentWorkflowState = "DONE";
                loadDailySubmissionCounterLogs(currentEngineerName);
            }
        } catch (err) {
            showCustomPopupAlertModal("System Error", "Database connection lost.");
            mainBtn.innerText = "🚀 Submit Photo & Location";
            mainBtn.disabled = false;
        }
    }

    function showCustomPopupAlertModal(titleText, bodyMessage) {
        document.getElementById("modalTitle").innerText = titleText;
        document.getElementById("modalMessage").innerText = bodyMessage;
        document.getElementById("customAlertModal").style.display = "flex";
    }

    function closeCustomAlertPopup() {
        document.getElementById("customAlertModal").style.display = "none";
        // If data submission was successful, keep the hidden preview freeze state
        if (currentWorkflowState !== "DONE") {
            document.getElementById("camera").style.display = "block";
            document.getElementById("photo").style.display = "none";
        }
    }

    function logoutEngineerSequence() {
        if (confirm("Are you sure you want to exit the dashboard?")) {
            if (mediaStreamTrackReference) {
                mediaStreamTrackReference.getTracks().forEach(track => track.stop());
            }
            localStorage.clear();
            window.location.href = "index.html";
        }
    }

    // Expose functional endpoints securely to HTML elements context
    window.handleDashboardWorkflowClick = handleDashboardWorkflowClick;
    window.triggerSelfieCaptureWorkflow = handleDashboardWorkflowClick; // Keep mapping fallback safe for button onclick
    window.resetToCameraMode = resetToCameraMode;
    window.closeCustomAlertPopup = closeCustomAlertPopup;
    window.logoutEngineerSequence = logoutEngineerSequence;

})();