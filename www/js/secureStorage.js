document.addEventListener('deviceready', initStorage, false);
function initStorage()
{
  alert("In initStorage");
  document.querySelector("#secureStorage").addEventListener("touchend",addKey);
  document.querySelector("#retrieveSecureStorage").addEventListener("touchend",retrieveKeys);

  function addKey()
  {
    var ss = new cordova.plugins.SecureStorage(
    function () {
        console.log('Success');
        alert('Success');
        alert('Success in Secure Storage');
        },
        function (error) {
          console.log('Error ' + error);
          alert("Error "+error);
        },
        'my_app');
    ss.set(
    function (key) {
      console.log('Set ' + key);
      alert('Key set successful Set ' + key);
    },
    function (error) {
      console.log('Error ' + error);
      alert('Error in setting key' + error.message+" : "+error.code);
    },
    'mykey', 'myvalue');
  }
  function retrieveKeys()
  {
    var ss = new cordova.plugins.SecureStorage(
    function () {
        console.log('Success');
        alert('Success');
        alert('Success in Secure Storage');
        },
        function (error) {
          console.log('Error ' + error);
          alert("Error "+error);
        },
        'my_app');
    ss.get(
    function (value) {
      console.log('Success, got ' + value);
      alert('Success, got ' + value);
   },
    function (error) {
      console.log('Error ' + error);
      alert('Error in retrieving keys ' + error.message+" : "+error.code);
    },
    'mykey');
  }
}
