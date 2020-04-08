// ------------------------------------------------------------------------------
/*  likePhoto(string,string,string)

    Definition:     This function simply updates the number of likes displayed on the screen,
                    As well as changes the color of the like button (heart) when the image
                    is liked and unliked.

    Variables:
        id:         Id of the current user.
        imgName:    The name of the images the user liked.
        ownerId:    The id of the owner of the image liked by the user.
*/
// ------------------------------------------------------------------------------
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
        document.getElementById("heart_id_"+imgName).style.fill = "gainsboro";
      }

      document.getElementById(imgName+'_likes').innerHTML = data.likes;
    })
    .catch((err) => {
      alert("Error");
    })
}
