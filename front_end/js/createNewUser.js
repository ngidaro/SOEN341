function createNewUser()
{
  var fname = document.getElementById("fName").value;
  var lname = document.getElementById("lName").value;
  var user = document.getElementById("user").value;
  var password = document.getElementById("pass").value;
  var email = document.getElementById("email").value;

  if(fname    === "" ||
     lname    === "" ||
     user     === "" ||
     password === "" ||
     email    === "")
   {
     alert("One or more fields are empty.");
     emptyFields();
     return;
   }

  fetch(`/create_account_page`,{method:'POST',
  headers: {
          "Content-Type": "application/json"
        },
      body:JSON.stringify({"email":email, "user":user,"fname":fname,"lname":lname,"password":password})})
    .then(res => res.json())
    .then(function(data){
      if(data.userExists)
      {
        alert("Username is already in use!");
        emptyFields();
      }
      else {
        alert("Account creation successful");
        window.location.href = "/profile_page/" + data.userID;
      }
    })
    .catch((err) => {
      alert("Error when entering information!");
    })
}

function emptyFields()
{
  document.getElementById("fName").value = "";
  document.getElementById("lName").value = "";
  document.getElementById("user").value = "";
  document.getElementById("pass").value = "";
  document.getElementById("email").value = "";
}
