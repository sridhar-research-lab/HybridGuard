document.addEventListener("deviceready", init, false);
function init() {
	
	function onSuccess(data) {
    alert('in success');
    alert('message: ' + data.message);
	}

// onError Callback receives a json object
//
	function onFail(error) {
	alert('in error');
    alert('message: ' + error.message);
	}

document.querySelector("#openFiles").addEventListener("touchend", function() {
	alert('before openfile');
	// cordova.plugins.fileOpener2.open(
 //    '/sdcard/Download/Dispatcher.pdf', // You can also use a Cordova-style file uri: cdvfile://localhost/persistent/Download/starwars.pdf
 //    'application/pdf', onSuccess, onFail); 
  
	//window.cordova.plugins.FileOpener.openFile("http://www.utdallas.edu/~hamlen/phung15tdsc.pdf", onSuccess, onFail);
	//window.cordova.plugins.FileOpener.canOpenFile("file:///storage/emulated/0/Download/insta_dragonfly.jpg", onSuccess, onError);
	//window.cordova.plugins.FileOpener.openFile("file:///storage/emulated/0/Download/Dispatcher.pdf", onSuccess, onError);		
	window.cordova.plugins.FileOpener.openFile("file:///storage/emulated/0/Download/insta_dragonfly.jpg", onSuccess, onFail);		
	});


}


// cordova.plugins.fileOpener2.open(
//     '/sdcard/Download/starwars.pdf', // You can also use a Cordova-style file uri: cdvfile://localhost/persistent/Download/starwars.pdf
//     'application/pdf', 
//     { 
//         error : function(e) { 
//             console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
//         },
//         success : function () {
//             console.log('file opened successfully');                
//         }
//     }
// );