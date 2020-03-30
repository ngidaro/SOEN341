function likePhoto(id,imgName,ownerId) {

  fetch(`/like_photo/${id}/${imgName}/${ownerId}`,{method:'POST','Content-Type': 'application/json'})
    .then(res => res.json())
    .then(function(data){
      debugger;

      if(data.bLiked)
      {
        document.getElementById("heart_id_"+imgName).style.fill = "red";
      }
      else {
        document.getElementById("heart_id_"+imgName).style.fill = "white";
      }

      document.getElementById(imgName+'_likes').innerHTML = data.likes;
    })
    .catch((err) => {
      alert("Error");
    })
}
