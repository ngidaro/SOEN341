// ------------------------------------------------------------------------------
/*  updateFollowButton(string,string)

    Definition: This function updates the Follow button dynamically without
                refreshing the page. Follow   -> Unfollow
                                     Unfollow -> Follow

    Variables:
        id:         The id of the current user.
        searchId:   The id of the user who the current user wants to follow/unfollow
        data:       Data returned from the server side.
*/
// ------------------------------------------------------------------------------
function updateFollowButton(id,searchId)
{
  var FollowUnfollow = "";
  fetch(`/follow_page/${id}/${searchId}`,{ method:"POST", 'Content-Type': 'application/json' })
  .then(res => res.json())
  .then(function(data){
    debugger;
    document.getElementById("nbFollowers_id").innerHTML = data.sNbFollowers;

    if(data.bIsFollowing)
    {
      FollowUnfollow = "Unfollow";
    }
    else {
      FollowUnfollow = "Follow";
    }
    document.getElementById("sFollow").innerHTML = FollowUnfollow;
  })
  .catch((err) => {
    alert("Follow Error");
  })
}
