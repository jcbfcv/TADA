// =====================================
// FCV Service Master
// gallery.js
// =====================================

// Elements
const galleryGrid = document.getElementById("galleryGrid");
const searchInput = document.getElementById("searchGallery");

// Temporary Gallery Data
let galleryData = [];

// Load Gallery
function loadGallery() {

    if (galleryData.length === 0) {

        galleryGrid.innerHTML = `
            <div class="gallery-card">
                <img src="../images/no-image.png" alt="No Image">

                <div class="gallery-info">
                    <h3>No Selfies Found</h3>
                    <p>No engineer has submitted a selfie yet.</p>
                </div>
            </div>
        `;

        return;
    }

    galleryGrid.innerHTML = "";

    galleryData.forEach((item) => {

        galleryGrid.innerHTML += `

        <div class="gallery-card">

            <img src="${item.selfie}" alt="Engineer Selfie">

            <div class="gallery-info">

                <h3>${item.engineer}</h3>

                <p><strong>Date:</strong> ${item.date}</p>

                <p><strong>Time:</strong> ${item.time}</p>

                <button
                    class="location-btn"
                    onclick="viewLocation('${item.location}')">

                    <i class="fa-solid fa-location-dot"></i>

                    View Location

                </button>

            </div>

        </div>

        `;

    });

}

// Search Engineer
searchInput.addEventListener("keyup", function () {

    const value = this.value.toLowerCase();

    const cards = document.querySelectorAll(".gallery-card");

    cards.forEach(card => {

        card.style.display = card.innerText.toLowerCase().includes(value)
            ? "block"
            : "none";

    });

});

// Open Location
function viewLocation(location) {

    if (!location) {

        alert("Location not available.");
        return;

    }

    window.open(location, "_blank");

}

// Logout
function logoutAdmin() {

    if (confirm("Are you sure you want to logout?")) {

        window.location.href = "admin-login.html";

    }

}

// Load Gallery
loadGallery();