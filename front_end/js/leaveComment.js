function addComment(id,username,imgOwnerID,imgName)
{
  if(document.getElementById('theComment_'+imgName).value == "")
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
          "comment": document.getElementById('theComment_'+imgName).value})})
    .then(res => res.json())
    .then(function(data){
      debugger;
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
