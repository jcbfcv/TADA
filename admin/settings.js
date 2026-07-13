/* =================================
   FCV Service Master
   Settings JS
================================= */


// Load Admin Data

document.addEventListener("DOMContentLoaded",()=>{


    let adminName = localStorage.getItem("adminName");


    if(adminName){

        document.getElementById("adminName").value = adminName;

    }


});





// Save Profile

function saveProfile(){


    let name = document
    .getElementById("adminName")
    .value;



    if(name.trim()===""){

        alert("Please enter admin name");
        return;

    }



    localStorage.setItem(
        "adminName",
        name
    );



    alert("Profile Updated Successfully");


}





// Change Password

function changePassword(){


    let oldPass = document
    .getElementById("oldPassword")
    .value;


    let newPass = document
    .getElementById("newPassword")
    .value;



    let savedPassword =
    localStorage.getItem("adminPassword");



    if(!savedPassword){


        savedPassword="1234";


    }



    if(oldPass !== savedPassword){


        alert("Old Password is incorrect");

        return;

    }




    if(newPass.length < 4){


        alert("Password must be minimum 4 characters");

        return;


    }



    localStorage.setItem(
        "adminPassword",
        newPass
    );



    alert("Password Updated Successfully");



    document.getElementById("oldPassword").value="";
    document.getElementById("newPassword").value="";


}





// Logout

function logoutAdmin(){


    localStorage.clear();


    window.location.href="index.html";


}