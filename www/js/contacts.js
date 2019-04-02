document.addEventListener("deviceready", onDevReady, false);
   function onDevReady() {
document.querySelector("#openContacts").addEventListener("touchend",function ()
  {
      callContactCollector();
  });
  function callContactCollector()
  {
    navigator.contacts.find([navigator.contacts.fieldType.displayName],
        function(c){
          document.getElementById("contact_results").innerHTML="<pre>Success Number of contacts is "+c.length+"</pre>"
          var temp="";
          for(var i=0;i<c.length;i++)
          {
              temp+=c[i].displayName+"\n";//+"--"c[i].phoneNumbers[0].type
          }
        //  alert("Success Number of contacts is \n"+temp);
          document.getElementById("contact_results").innerHTML="<pre>Success Number of contacts is "+c.length+"\nThe names are :\n"+temp+"</pre>"
        }, function(e){
          alert("Failure\n message : "+e.message+"\nCode : "+e.code);
        })
  }
}
