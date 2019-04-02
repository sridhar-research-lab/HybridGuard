document.addEventListener("deviceready", initRemoteMsg, false);
function initRemoteMsg() {
	document.querySelector("#sendRemoteMessage").addEventListener("touchend",sendRemoteMessage , false);
    function sendRemoteMessage()
    {

        alert("Send Message Clicked!!");
		alert(document.getElementById("locDetailsDiv").value);
		alert(document.getElementById("locDetails").value);

		var message = document.getElementById("locDetailsDiv").innerHTML+" Test!";
        var number ="+15167543456";
        sms.send(number,message,{}, function(message) {
			console.log("success: " + message);
			alert("success: " + message);
		}, function(error) {
			console.log("error: " + error.code + " " + error.message);
			alert("Unable to send Remote Message, error is : " + error.code + " " + error.message);
		});
    }
}
