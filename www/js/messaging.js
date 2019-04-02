document.addEventListener("deviceready", initMsg, false);
function initMsg() {
	document.querySelector("#sendMessage").addEventListener("touchend",sendMessage , false);
    function sendMessage()
    {

        alert("Send Message Clicked!!");
		alert(document.getElementById("locDetailsDiv").value);
		alert(document.getElementById("locDetails").value);

		var message = document.getElementById("locDetailsDiv").innerHTML+" Test!";
        var number ="+15167543456";
        debugger
        alert(sms)
        sms.send(number,message,{}, function(message) {
			console.log("success: " + message);
			alert("success: " + message);
			navigator.notification.alert(
			    'Message to ' + number + ' has been sent.',
			    null,
			    'Message Sent',
			    'Done'
			);

		}, function(error) {
			console.log("error: " + error.code + " " + error.message);
			alert("error: " + error.code + " " + error.message);
			navigator.notification.alert(
				'Sorry, message not sent: ' + error.message,
				null,
				'Error',
				'Done'
			);
		});
    }
}
