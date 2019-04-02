
document.addEventListener("deviceready", getSensorDetails, false);

function getSensorDetails()
{
  navigator.accelerometer.getCurrentAcceleration(function(acceleration)
  {
    // when success
    console.log('Acceleration X/Y/Z ' + acceleration.x + '/'
    + acceleration.y + '/'
    + acceleration.z +
    ' at ' + acceleration.timestamp);
    x="X : "+acceleration.x+"\n"+
    "Y : "+acceleration.y+"\n"+
    "Z : "+acceleration.z+"\n"+
    "At : "+acceleration.timestamp+"\n";
    document.getElementById("accDetails").innerHTML="<pre>"+x+"</pre>"
  }, function(err)
  {
    // when error
    console.log('we have an error '+err.code+" : "+err.message);
  });
}
navigator.accelerometer.watchAcceleration(getSensorDetails,
  onErrorCallback,
  {period: 100});

function onSuccessCallback(acceleration)
{
  x="X : "+acceleration.x+"\n"+
  "Y : "+acceleration.y+"\n"+
  "Z : "+acceleration.z+"\n"+
  "At : "+acceleration.timestamp+"\n";
  document.getElementById("accDetails").innerHTML="<pre>"+x+"</pre>"
}

function onErrorCallback(errors)
{
  console.log("Error while accessing accelerometer with code "+errors.code+" and message "+errors.message);
}
