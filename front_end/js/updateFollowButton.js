function updateFollowButton(id,searchId)
{
  var FollowUnfollow = "";
  fetch(`/follow_page/${id}/${searchId}`,{ method:"POST", 'Content-Type': 'application/json' })
  .then(res => res.json())
  .then(function(data){
    debugger;
    document.getElementById("followers_id").innerHTML = "Followers\n" + data.sNbFollowers;

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
