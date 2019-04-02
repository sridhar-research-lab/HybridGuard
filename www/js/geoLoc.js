document.addEventListener("deviceready", onDeviceReady, false);
   function onDeviceReady() {
       console.log("navigator.geolocation works well");
       //alert("Geo!!");
       document.getElementById("loadExtUrl").addEventListener("click",loadExtWebPage);
       console.log("click listner set to load url button");
       navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoError,{ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
       function onGeoError(err)
       {
         alert("Location not found!\n"+
              'code: '    + err.code    + '\n' +
              'message: ' + err.message + '\n');
       }
       function onGeoSuccess(position)
       {
         x=('Latitude: '          + position.coords.latitude          + '\n' +
              'Longitude: '         + position.coords.longitude         + '\n' +
              'Altitude: '          + position.coords.altitude          + '\n' +
              'Accuracy: '          + position.coords.accuracy          + '\n' +
              'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
              'Heading: '           + position.coords.heading           + '\n' +
              'Speed: '             + position.coords.speed             + '\n' +
              'Timestamp: '         + position.timestamp                + '\n');
              //document.querySelector("#locDetailsParagraph").innerHTML="<pre>"+x+"</pre>";
              document.getElementById("locDetailsDiv").innerHTML="<pre>"+x+"</pre>";
  //            alert(x)
       }
       document.querySelector("#getGeoLoc").addEventListener("touchend", function() {
         navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoError,{ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
       });
       function loadExtWebPage()
       {
         console.log("Trying to load webpage");
         window.open("http://accelerometer.usite.pro/","_blank");
         console.log("Page loaded....");
       }
   }
