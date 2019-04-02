document.addEventListener("deviceready", onDeviceReadyEmail, false);
function onDeviceReadyEmail()
{
    document.querySelector("#sendEmail").addEventListener("touchend",sendMails , false);
    autoEmail = window.background.Email;
    function sendMails()
    {
        alert("In sendMails");
        var emailObject = {
            from: "rahulr301@gmail.com", //your email
            to: "rahulr301@gmail.com", //the destination email
            subject: "Test Subject", //Subject
            body: "Test Message", //Body message
            login: "rahulr301@gmail.com", //Same as "from" (for some cases just 'yourID' is necessary)
            password: "", //Your email's password
            relayHost: "smtp.google.com" //Ex: "smtp.google.com"
        }
        alert("Sending mail");
        autoEmail.send(emailObject, onSuccessMail, onFailureMail);
        alert("Mail sent");
        var onSuccessMail = function(msg){
            alert("Email sent!"+msg); //
        }

        var onFailureMail = function(error){
            alert("Email not sent! "+error.message+" "+error.code);
        }
    }
    function composeMail()
    {
        alert("In composeMail");
    }
}
