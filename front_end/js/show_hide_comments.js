function showComments(imgName,totalComments)
{

  if(totalComments == 0)
  {
    return;
  }
  else {
    document.getElementById(imgName + "_showAll").style.display = 'none'
    document.getElementById(imgName + "_hideAll").style.display = 'block'
  }
}

function hideComments(imgName)
{
  document.getElementById(imgName + "_hideAll").style.display = 'none'
  document.getElementById(imgName + "_showAll").style.display = 'block'
}
