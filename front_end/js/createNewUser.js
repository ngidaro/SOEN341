// ------------------------------------------------------------------------------
/*  createNewUser()

    Definition: On the create_account_page, the user can enter data into the textboxes.
                This function will take the data written by the user in the textboxes and
                using the Fetch API, will send a request to the /create_account_page.
                This function will check to see if all the fields are populated. If the fields
                are empty, the user will be notified. If the fields are all populated, the data will be
                checked on the server side to see if the username is already taken. If the username is
                not taken, the page will redirect to the user's new profile page.

    Variables:
        fname:      String of the First Name entered by the user.
        lname:      String of the Last Name entered by the user.
        user:       String of the username entered by the user.
        password:   String of the password entered by the user.
        email:      String of the email entered by the user.
*/
// ------------------------------------------------------------------------------
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

// ------------------------------------------------------------------------------
/*  emptyFields()

    Definition: This function is called when the textfields on create_account_page
                are empty or invalid. This function simply empties the fields.
*/
// ------------------------------------------------------------------------------
function emptyFields()
{
  document.getElementById("fName").value = "";
  document.getElementById("lName").value = "";
  document.getElementById("user").value = "";
  document.getElementById("pass").value = "";
  document.getElementById("email").value = "";
}
