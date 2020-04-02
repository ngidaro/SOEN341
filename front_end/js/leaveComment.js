// ------------------------------------------------------------------------------
/*  addComment(string,string,string,string)

    Definition: Submits the comment of the user on a picture.

    Variables:
      id:               id of the user commenting.
      username:         Username of the current user.
      imgName:          Name of the image being focused on.
      userComment:      The comment written by the user.
      userProfilePic:   The profile picture of the user commenting.
      totalComments:    Number of comments on that picture.

      Notes:  This could be merged with createComment() from show_hide_comments.js
              The difference between them is the parameters passed.
*/
// ------------------------------------------------------------------------------
function addComment(id,username,imgOwnerID,imgName)
{
  var userComment = document.getElementById('theComment_'+imgName).value;
  if( userComment == "")
  {
    console.log("Empty String");
  }
  else {
    fetch(`/leaveComment/${id}/${username}/${imgOwnerID}/${imgName}`,{
      method:'POST',
      //Headers is needed when using body
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({
          "comment": userComment})})
    .then(res => res.json())
    .then(function(data){
      debugger;

      //If the comments are shown, then display the user's comment right away
      if(document.getElementById(imgName + "_hideAll").style.display == 'block')
      {
        createNewComment(username,imgName,userComment,data.userProfilePic);
      }

      if(data.isPosted)
      {
        document.getElementById('showall_'+imgName+'_id').innerHTML = `Show all (${data.totalComments})`;
        document.getElementById('theComment_'+imgName).value = "";
      }

    })
    .catch((err) => {
      alert("Add Comment Error");
    })
  }
}

// ------------------------------------------------------------------------------
/*  addCommentFocused(string,string,string,string)

    Definition: Creates a comment only when the comments are actually displayed "Show all".
                The comment consists of the user's profile picture, username and comment.

                Similar functionality as addComment and createNewComment but without profile picture

      Notes:  This is no longer being usSed. Used to be used when an image is pressed
              and redirected to focused_myimage.
              Will keep here in case it needs to be used in the future.
*/
// ------------------------------------------------------------------------------
function addCommentFocused(id,username,imgOwnerID,imgName)
{
  userComment = document.getElementById('theComment_'+imgName).value;
  if(userComment == "")
  {
    console.log("Empty String");
  }
  else {
    fetch(`/leaveComment/${id}/${username}/${imgOwnerID}/${imgName}`,{
      method:'POST',
      //Headers is needed when using body
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({
          "comment": userComment})})
    .then(res => res.json())
    .then(function(data){
      debugger;
      if(data.isPosted)
      {

        user = document.createElement("a");
        br  = document.createElement("br");
        bold = document.createElement('strong');

        username = document.createTextNode(username + " ");
        bold.appendChild(username);

        comment = document.createTextNode(document.getElementById('theComment_'+imgName).value);

        user.appendChild(bold);
        user.appendChild(comment);
        user.appendChild(br);

        document.getElementById("allComments").appendChild(br);
        document.getElementById("allComments").appendChild(user);

        document.getElementById('theComment_'+imgName).value = "";

      }
    })
    .catch((err) => {
      alert("Add Comment Error");
    })
  }
}

// ------------------------------------------------------------------------------
/*  createNewComment(string,string,string,string)

    Definition: Creates a comment only when the comments are actually displayed "Show all".
                The comment consists of the user's profile picture, username and comment.

    Variables:
      username:       Username of the current user.
      imgName:        Name of the image being focused on.
      comment:        The comment written by the user.
      profilePicture: The profile picture of the user commenting.
      img:            Tag which contains the profile image of the commenting user.
      br:             Newline.
      bold:           Bold the user's name who commented.
      user:           Tag which contains the username and comment
      userName:       Tag which contains the username of the person who commented.
      comment:        Tag which contains the comment.
      mainDiv:        name of the div tag found in the ejs file.

      Notes:  This could be merged with createComment() from show_hide_comments.js
              The difference between them is the parameters passed.
*/
// ------------------------------------------------------------------------------
function createNewComment(username,imgName,comment,profilePicture)
{
  img = document.createElement("IMG");
  br  = document.createElement("br");
  bold = document.createElement('strong');

  img.src = "/uploads/"+ profilePicture;
  img.height = "20";
  img.width = "20";
  img.style.cssText = "border-radius:50%; margin-bottom:4px; margin-right:4px";
  // img.onclick = verify.connectAccount(id,userProfile._id);

  user = document.createElement('a');
  username = document.createTextNode(username + " ");
  bold.appendChild(username);

  comment = document.createTextNode(comment);

  user.appendChild(bold);
  user.appendChild(comment);
  user.appendChild(br);

  mainDiv = document.getElementById(imgName + "_comments");
  mainDiv.appendChild(img);
  mainDiv.appendChild(user);
}
