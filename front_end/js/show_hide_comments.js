// var verify = require('/js/verifyUser.js');
// ------------------------------------------------------------------------------
/*  showComments(string,string)

    Definition: When the "show all" button is pressed below an image, this function,
                uses the fetch API and gets the comments from the database and Displays
                them.

    Variables:
      commentData:    Array of objects which contains all comments and username associated
                      to the image in which the user wants to see the comments.
      userProfile:    Array of objects which contains all the info pertaining to the users who
                      commented.
      imgName:        The name of the image being viewed.
      id:             ID of the current user.

*/
// ------------------------------------------------------------------------------
function showComments(imgName,id)
{
  fetch(`/show_comments/${imgName}`,{ method:"POST", 'Content-Type': 'application/json' })
  .then(res => res.json())
  .then(function(data){
    debugger;
    if(!data.commentsExist)
    {
      return;
    }
    else {

      // alert(data.userProfile.length);

      // populate the comments section

      for (var i = 0; i < data.allComments.length; i++) {
        for (var j = 0; j < data.userProfile.length; j++) {
          if (data.allComments[i].username === data.userProfile[j].username) {
            createComment(data.allComments[i],data.userProfile[j],imgName,id);
            break;
          }
        }
      }

      document.getElementById(imgName + "_showAll").style.display = 'none';
      document.getElementById(imgName + "_hideAll").style.display = 'block';
    }
  })
  .catch((err) => {
    alert("Show Comments Error");
  })
}

// ------------------------------------------------------------------------------
/*  hideComments(string)

    Definition: When the "Hide all" button is pressed, this function deletes all the
                child tags within a specific tag (deletes all comments). The comments
                display when the "show all" button is pressed

    Variables:
      imgName:  Name of the image displaying the comments.
      e:        Variable which contains the image.
      child:    The child tags of 'e'.

*/
// ------------------------------------------------------------------------------
function hideComments(imgName)
{
  e = document.getElementById(imgName + "_comments");
  var child = e.lastElementChild;
  while (child) {
    e.removeChild(child);
    child = e.lastElementChild;
  }
  document.getElementById(imgName + "_hideAll").style.display = 'none';
  document.getElementById(imgName + "_showAll").style.display = 'block';
}

// ------------------------------------------------------------------------------
/*  createComment(array,array,string)

    Definition: This function is called by showComments. When the user wants to see the
                comments of a picture on a page, this function generates the html for each comment.

    Variables:
      commentData:    Array of objects which contains all comments and username associated
                      to the image in which the user wants to see the comments.
      userProfile:    Array of objects which contains all the info pertaining to the users who
                      commented.
      imgName:        The name of the image being viewed.
      id:             ID of the current user.
      img:            Tag which contains the profile image of the commenting user.
      br:             Newline.
      bold:           Bold the user's name who commented.
      user:           Tag which contains the username and comment
      userName:       Tag which contains the username of the person who commented.
      comment:        Tag which contains the comment.
      mainDiv:        name of the div tag found in the ejs file.

*/
// ------------------------------------------------------------------------------

function createComment(commentData,userProfile,imgName,id){

  img = document.createElement("IMG");
  br  = document.createElement("br");
  bold = document.createElement('strong');

  img.src = "/uploads/"+userProfile.profilePic;
  img.height = "20";
  img.width = "20";
  img.style.cssText = "border-radius:50%; margin-bottom:4px; margin-right:4px";
  // img.onclick = verify.connectAccount(id,userProfile._id);

  user = document.createElement('a');
  username = document.createTextNode(commentData.username + " ");
  bold.appendChild(username);

  comment = document.createTextNode(commentData.comment);

  user.appendChild(bold);
  user.appendChild(comment);
  user.appendChild(br);

  mainDiv = document.getElementById(imgName + "_comments");
  mainDiv.appendChild(img);
  mainDiv.appendChild(user);

}
