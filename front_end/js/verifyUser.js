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
