// ------------------------------------------------------------------------------
/*  verifyID(string,string)

    Definition: This function is for profile images linked to a user's profile page.
                This function will verify that the user is clicking a profile image
                that is not themselves and will redirect to the follow or profile page
                depending if the user clicks their profile image or not.

    Variables:
        id:         The id of the current user.
        searchId:   The id of the user who the current user clicked on.
*/
// ------------------------------------------------------------------------------
function verifyID(id,searchedID)
{
  if(id == searchedID)
  {
    window.location.href = "/profile_page/" + id;
  }
  else {
    window.location.href = "/follow_page/" + id + "/" + searchedID;
  }
}
