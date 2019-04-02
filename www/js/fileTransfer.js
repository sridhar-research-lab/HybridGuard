document.addEventListener("deviceready", onFTDevReady, false);
function onFTDevReady() {

  document.querySelector("#openContacts").addEventListener("touchend",function ()
  {
    alert("File transfer clicked");
    callFileTransfer();
  });

  function callFileTransfer()
  {

  }
}
