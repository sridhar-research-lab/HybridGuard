document.addEventListener('deviceready', initMedia, false);
function initMedia()
{
  alert("In mediaRecorder");
  document.querySelector("#recordVideo").addEventListener("touchend",recordVideoFunc);
  var captureSuccess = function(mediaFiles) {
      var i, path, len;
      for (i = 0, len = mediaFiles.length; i < len; i += 1) {
          path = mediaFiles[i].fullPath;
          // do something interesting with the file
      }
  };

  // capture error callback
  var captureError = function(error) {
    alert("In mediaRecorder");
      console.log('Error code: ' + error.code, null, 'Capture Error');
      alert('Error code: ' + error.code, null, 'Capture Error');
  };
  function recordVideoFunc() {
    alert("recordVideo clicked!")
    var options = { limit: 2, quality: 0 };
    navigator.device.capture.captureVideo(captureSuccess, captureError, options);
  }
}
