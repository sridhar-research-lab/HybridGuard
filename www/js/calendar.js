document.addEventListener("deviceready", init, false);
function init() {

	function onSuccess(imageData) {
		console.log('success');
		alert("Success: " + JSON.stringify(message));
	}

	function onFail(message) {
		alert('Failed because: ' + message);
		alert("Error: " + message);
	}

	//Use Calendar
	document.querySelector("#openCalendar").addEventListener("touchend", function() {
		 alert("Calendar touched");
		 window.plugins.calendar.openCalendar();
	});

}
