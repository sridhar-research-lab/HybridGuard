document.addEventListener("deviceready", init, false);
function init() {
// capture callback
    var captureSuccess = function(mediaFiles) {
        var i, path, len;
        for (i = 0, len = mediaFiles.length; i < len; i += 1) {
            path = mediaFiles[i].fullPath;
            console.log(mediaFiles)
            // do something interesting with the file
        }
    };

    // capture error callback
    var captureError = function(error) {
        navigator.notification.alert('Error code: ' + error.code, null, 'Capture Error');
    };

    // start audio capture
    document.querySelector("#recordAudio").addEventListener("touchend", function() {
        navigator.device.capture.captureAudio(captureSuccess, captureError, {duration:10}); 
    });
}