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

//To be able to click on a user's image next to their comment and it will bring them to their profile
// module.exports = {
//
//   connectAccount : function(id,searchedID){
//     if(id == searchedID)
//     {
//       window.location.href = "/profile_page/" + id;
//     }
//     else {
//       window.location.href = "/follow_page/" + id + "/" + searchedID;
//     }
//   }
// }
