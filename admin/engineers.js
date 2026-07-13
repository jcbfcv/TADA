// =====================================
// FCV Service Master
// engineers.js
// =====================================

// Temporary Engineer List
let engineers = [];

// Elements
const engineerTable = document.getElementById("engineerTable");
const popup = document.getElementById("engineerPopup");
const searchInput = document.getElementById("searchEngineer");

// Open Popup
function openAddEngineer() {
    popup.style.display = "flex";
}

// Close Popup
function closePopup() {
    popup.style.display = "none";

    document.getElementById("engName").value = "";
    document.getElementById("engMobile").value = "";
    document.getElementById("engPin").value = "";
}

// Save Engineer
function saveEngineer() {

    const name = document.getElementById("engName").value.trim();
    const mobile = document.getElementById("engMobile").value.trim();
    const pin = document.getElementById("engPin").value.trim();

    if (!name || !mobile || !pin) {
        alert("Please fill all fields.");
        return;
    }

    if (pin.length !== 4) {
        alert("PIN must be 4 digits.");
        return;
    }

    engineers.push({
        id: engineers.length + 1,
        name,
        mobile,
        pin,
        status: "Active"
    });

    renderTable();
    closePopup();
}

// Show Table
function renderTable() {

    if (engineers.length === 0) {

        engineerTable.innerHTML = `
            <tr>
                <td colspan="6">No Engineers Found</td>
            </tr>
        `;
        return;
    }

    engineerTable.innerHTML = "";

    engineers.forEach((eng, index) => {

        engineerTable.innerHTML += `
        <tr>
            <td>${eng.id}</td>
            <td>${eng.name}</td>
            <td>${eng.mobile}</td>
            <td>${eng.pin}</td>
            <td>${eng.status}</td>

            <td>

                <button class="edit-btn"
                    onclick="editEngineer(${index})">
                    Edit
                </button>

                <button class="delete-btn"
                    onclick="deleteEngineer(${index})">
                    Delete
                </button>

            </td>
        </tr>
        `;

    });

}

// Delete Engineer
function deleteEngineer(index){

    if(confirm("Delete this engineer?")){

        engineers.splice(index,1);

        renderTable();
    }

}

// Edit Engineer
function editEngineer(index){

    const eng = engineers[index];

    document.getElementById("engName").value = eng.name;
    document.getElementById("engMobile").value = eng.mobile;
    document.getElementById("engPin").value = eng.pin;

    popup.style.display="flex";

    engineers.splice(index,1);

}

// Search Engineer

searchInput.addEventListener("keyup",function(){

    const value=this.value.toLowerCase();

    const rows=document.querySelectorAll("#engineerTable tr");

    rows.forEach(row=>{

        row.style.display=row.innerText.toLowerCase().includes(value)
        ? ""
        : "none";

    });

});

// Logout

function logoutAdmin(){

    if(confirm("Logout?")){

        window.location.href="admin-login.html";

    }

}

// Load
renderTable();