/********************************************************************
Definition: Checks if an image has an "onclick" event. If there is,
            it changes the mouse cursor to a pointer by adding the
            class name "clickableIcon" to the element.
            CSS is found in "profilePic.css".

Purpose:    Makes it obvious when an image is clickable.
*******************************************************************/
var imgElement = document.getElementsByTagName("img");

for(var i = 0; i < imgElement.length; i++) {
  if(imgElement[i].hasAttribute("onclick")) {
    imgElement[i].classList.add("clickableIcon");
  }
}
