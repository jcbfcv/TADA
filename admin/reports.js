// ======================================
// FCV Service Master
// reports.js
// ======================================


// Load Reports When Page Open

document.addEventListener("DOMContentLoaded",()=>{

    loadReports();

});



// Sample Report Data

let reports = [

{
    engineer:"Rahul Sharma",
    date:"2026-07-12",
    time:"09:15 AM",
    status:"Present",
    selfie:"Submitted",
    location:"Available"
},

{
    engineer:"Amit Verma",
    date:"2026-07-12",
    time:"09:30 AM",
    status:"Present",
    selfie:"Submitted",
    location:"Available"
},

{
    engineer:"Neha Patel",
    date:"2026-07-12",
    time:"10:00 AM",
    status:"Absent",
    selfie:"Not Submitted",
    location:"Not Available"
}

];




// Load Reports Function

function loadReports(){


    let date = document.getElementById("reportDate").value;

    let search = document
    .getElementById("searchEngineer")
    .value
    .toLowerCase();



    let table = document.getElementById("reportTable");


    table.innerHTML="";


    let filtered = reports.filter((item)=>{


        let matchName = item.engineer
        .toLowerCase()
        .includes(search);



        let matchDate = date===""
        || item.date===date;



        return matchName && matchDate;


    });



    if(filtered.length===0){


        table.innerHTML=`

        <tr>
        <td colspan="6">
        No Report Found
        </td>
        </tr>

        `;

        return;

    }



    filtered.forEach((item)=>{


        table.innerHTML += `

        <tr>

        <td>${item.engineer}</td>

        <td>${item.date}</td>

        <td>${item.time}</td>

        <td>
        <span class="status">
        ${item.status}
        </span>
        </td>

        <td>${item.selfie}</td>

        <td>${item.location}</td>


        </tr>

        `;


    });



    updateCards();


}




// Update Summary Cards

function updateCards(){


document.getElementById("totalEngineers").innerHTML =
reports.length;


document.getElementById("totalAttendance").innerHTML =
reports.filter(
item=>item.status==="Present"
).length;


document.getElementById("totalSelfies").innerHTML =
reports.filter(
item=>item.selfie==="Submitted"
).length;


document.getElementById("totalLocations").innerHTML =
reports.filter(
item=>item.location==="Available"
).length;


}




// PDF Export

function exportPDF(){

alert("PDF Report Export Coming Soon");

}




// Excel Export

function exportExcel(){

alert("Excel Report Export Coming Soon");

}




// Admin Logout

function logoutAdmin(){

localStorage.clear();

window.location.href="index.html";

}