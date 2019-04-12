(function(){
    var debug = true;
    //constant will not allow the policy to get modified by the attacker while the script is executing.
    const policy = JSON.parse(get_URL('js/policy_config.json'));
    //var actual_JSON;
    function irm_log(s){
        if((!debug) || (!console.log)) return;
        console.log('IRM log:'+s);
    }
    //store builtin functions to keep their original implementations
    var $Array = Array;
    var $Object = window.Object;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var builtins = {};

    builtins.__proto__ = null;
    with (Function.prototype)
    builtins.Function = { apply: apply, call: call, /*toSource: toSource,*/toString: toString };

    // Create a function from a string.  Note that functions created with
    // the Function constructor DO NOT get a scope chain that includes the
    // current lexical scope; their scope chains include only the global
    // context.  To export local function declarations, we do some simple
    // parsing of the string form of the function and append commands that
    // explicitly export each definition.  Ads can obviously defeat this
    // process in a variety of ways, but doing so just harms themselves.
    var HG = (function() {

        var HGInstances = {};

        function create (key) {
            // Following function is private, but can be accessed by the public functions
            var principal;
            var instance_key = key;
            this.setPrincipal = function(thisPrincipal){
                principal = thisPrincipal;
            }
            this.getPrincipal = function(){
                return principal;
            }

            function makeFunction(body, principal) {
                if(body===undefined) throw new Error('makeFunction error: No code to make a function.');
                var locals = body.match(/function\s+\w+\(/g);
                var fnames = "";
                if (locals) {
                    body += ';';
                    for (var i=0; i<locals.length; ++i) {
                        var fname = locals[i].slice(8).match(/\w+/);
                        fnames += 'if(typeof('+fname+')!="undefined")window.'+fname+'='+fname+';\n';
                    }
                }
                body = fnames+"\n"+body;
                return new Function(body);
            }
            
            // This protected function executes code f at the privileges of a
            // specified principal.
            //revised version supporting AS calls
            function execWith(principal, f) {
                if(f==undefined) return;
                console.log(HGInstances[instance_key]);
                this.setPrincipal(principal);
                
                //ensure to call original apply function
                f.apply = builtins.Function.apply;
                try{
                    var r = f.apply(this,$Array.prototype.slice.call(arguments,2));
                }catch(e){}

                if (typeof r !== "undefined") return r;
            }

            function execScript(principal, dynamic_script_code){
                setPrincipal(principal);
                var dynamic_script = makeFunction(dynamic_script_code, principal); // call our code for turning a string into a global-scoped function
                execWith(principal, dynamic_script);
            }

            /********************** Begin the IRM code ******************************/
            //The common monitor function to intercept a function call with a policy
            var monitorMethod = function(object, method, policy) {
                // Find function corresponding to alias
                while (!hasOwnProperty.call(object, method) && object.__proto__)
                object = object.__proto__;
                if (object === null)
                throw new Error('Failed to find function for alias ' + method);
                var original = object[method];
                if ((original === null) || (original === undefined))
                throw new Error('No method ' + method +' found for '+ object.toString);
                //make sure to call the original apply function
                original.apply = builtins.Function.apply;
                object[method] = function wrapper() {
                    this.principal = principal? principal : this.principal;
                    var object = this;
                    var orgArgs = arguments;
                    var proceed = function() {
                        return original.apply(object, orgArgs, this.principal);
                    };
                    return policy(orgArgs, proceed, this.principal);
                }
            }
            var querySelector_policy = function(args, proceed, principal) {
                var element = proceed();
                monitorMethod(element, 'addEventListener', addEventListener_policy);
                return element;
            };
            var addEventListener_policy = function(args, proceed, principal) {
                //interface
                //element.addEventListener(type, listener[, useCapture]);
                var listener = args[1];
                console.log("eventlistner policy principal : "+ principal)
                args[1] = function(){return execWith(principal, listener)};
                return proceed();
            };

            if(Element.prototype.addEventListener)
            monitorMethod(Element.prototype, 'addEventListener', addEventListener_policy);
            if(Node.prototype.addEventListener)
            monitorMethod(Node.prototype, 'addEventListener', addEventListener_policy);

            monitorMethod(document, 'addEventListener', addEventListener_policy);
            monitorMethod(document, 'querySelector', querySelector_policy);

            if(Element.prototype.attachEvent)
            monitorMethod(Element.prototype, 'attachEvent', addEventListener_policy);

            if(Node.prototype.attachEvent)
            monitorMethod(Node.prototype, 'attachEvent', addEventListener_policy);

            // Return an object that is assigned to Module
            return {
                execScript: function(principal, dynamic_script_code) {
                    execScript(principal, dynamic_script_code); // execScript has direct access to execScript
                },
                monitorMethod : function(object, method, policy){
                    monitorMethod(object, method, policy)
                },
                thisPrincipal: function(){
                    return getPrincipal();
                },
                setPrincipal: function(principal) {
                    setPrincipal(principal);
                }
            };
        }
        return {
            getInstance: function(key) {
              if(!HGInstances[key]) {
                HGInstances[key] = create(key);
              }
              return HGInstances[key];
            }
        };
    }());

//===========================Loading the policy_config.json=========================================

function get_URL(url){
    // //alert('in get URL');
   var xhr = new XMLHttpRequest();
   var fileSrc;
   xhr.open('GET',url,false);
   xhr.onreadystatechange = function() {
     if (this.readyState === 4 && this.status == 200) {
        fileSrc = this.responseText;
     }
   }

   try{
     xhr.send(null);
     return fileSrc;
   }catch(e){
     //alert(e);
   }
   return '';
}
//==========================POLICY CHECK========================================
var principal_permission_check = function(principal,method,args){
    for(i=0;i<policy.resources.length;i++){
      if(policy.resources[i].name == method.toString()){
        resource = policy.resources[i].name;
        for(j=0;j<policy.resources[i].permissions.length;j++){
          if(policy.resources[i].permissions[j].principal_id == principal.toString()){
            if(policy.resources[i].permissions[j].send == "true"){
                return true;
            }
            else if(policy.resources[i].permissions[j].read == "true"){
                return true;
            }
            else{
                return false;
            }
          }
        }
      }
    }
    return false;
    }
 //=============================================================================================

    var unique_identifier;
    var HG_instance;
    var geolocation_policy = function(args, proceed, principal) {
        alert("!!!!!        geolocation_policy        !!!!!");
        alert("principal \' " + principal + "\' invokes navigator.geolocation.getCurrentPosition");
        var isAllowed = principal_permission_check(principal,"geolocation",args);
        if(isAllowed == true){
            location_read = true;
            return proceed();//run the original method
        }
        else{
            alert("Access not allowed");
        }
    };

    var camera_policy = function(args, proceed, principal) {
        alert("Inside camera policy");
        alert("principal \' " + principal);
        if(principal_permission_check(principal,'camera',args)){
            return proceed();//run the original method
        }else{
            alert("Access Denied");
        }
    };
    var captureVideo_policy = function(args,proceed, principal)
    {
        alert("principal \' " + principal + "\' invokes navigator.device.capture.captureVideo");
        alert("!!!!!captureVideo_policy!!!!!");
        if(principal_permission_check(principal,'video',args)){
            alert("Policy working correctly")
            return proceed();
        }
    }
    var audio_policy = function(args, proceed, object) {
        alert("Inside audio policy");
        var principal = thisPrincipal();
        return proceed();
    };
    var current_accelerometer_policy = function(args, proceed,object)
    {
        var principal = thisPrincipal();
        // var element = proceed();
        // monitorMethod(element,'addEventListener',addEventListener_policy);
        alert("principal \' " + principal + "\' invokes navigator.accelerometer.getCurrentAcceleration");
        if(principal_permission_check(principal,"accelerometer",args)) {
            return proceed();
        }
    }
    var watch_accelerometer_policy = function(args, proceed,object)
    {
        var principal = thisPrincipal();
        alert("principal \' " + principal + "\' invokes navigator.accelerometer.watchAcceleration");
        // alert("!!!!!gwatch_accelerometer_policy!!!!!");
        return proceed();
    }
    var get_album_policy = function(args, proceed,object)
    {
        var principal = thisPrincipal();
        alert("principal \' " + principal + "\' invokes GalleryAPI.prototype.getAlbums");
        alert("!!!!!get_album_policy!!!!!");
        return proceed();
    }
    var get_media_policy = function(args, proceed,object)
    {
        var principal = thisPrincipal();
        alert("principal \' " + principal + "\' invokes GalleryAPI.prototype.getMedia");
        alert("!!!!!get_media_policy!!!!!");
        return proceed();
    }

    var contacts_policy = function(args,proceed,object)
    {
        var principal = thisPrincipal();
        alert("principal \' " + principal + "\' invokes navigator.contacts.find");
        alert("!!!!!contact_policy!!!!!");
        if(principal_permission_check(principal,"contacts",args)){
            contact_read = true
            return proceed();
        }else{
            alert("Access Denied for Contacts")
        }
    }
    var captureVideo_policy = function(args,proceed,object)
    {
        var principal = thisPrincipal();
        alert("principal \' " + principal + "\' invokes navigator.device.capture.captureVideo");
        alert("!!!!!captureVideo_policy!!!!!");
        if(principal_permission_check(principal,'video',args)){
            alert("Policy working correctly")
            return proceed();
        }
    }
    var addToSecureStorage_policy = function(args,proceed,object)
    {
        var principal = thisPrincipal();
        alert("principal \' " + principal + "\' invokes cordova.plugins.SecureStorage.set");
        alert("!!!!!addToSecureStorage_policy!!!!!");
        return proceed();
    }
    var getFromSecureStorage_policy = function(args,proceed,object)
    {
        var principal = thisPrincipal();
        alert("principal \' " + principal + "\' invokes cordova.plugins.SecureStorage.get");

        alert("!!!!!getFromSecureStorage_policy!!!!!");
        isAllowed = principal_permission_check(principal_id,"secureStorage",args,operation="write")
        if(isAllowed){
            return proceed()
        }
        else {
            alert("Not Allowed")
        }
    }
    var secureStorage_policy = function(args,proceed,object)
    {
        var principal = thisPrincipal();
        alert("principal \' " + principal + "\' invokes cordova.plugins.SecureStorage");
        alert("!!!!!secureStorage_policy!!!!!");
        isAllowed = principal_permission_check(principal_id,"secureStorage",args,operation="write")
        if(isAllowed){
            alert("here")
            return proceed()
        }
        else {
            alert("Not allowed")
        }
    }

    var open_calendar_policy = function(args, proceed, object)
    {
        var principal = thisPrincipal();
        alert("!!!!!! Calendar Policy !!!!!!!!!!");

        var isAllowed = principal_permission_check(principal,"calendar",args);
        if(isAllowed == true){
            return proceed();//run the original method
        }
        else{
            alert("Access to calendar not allowed");
        }
    }

    var whitelist_check = function(args) {
        // var response = get_URL('js/policy_config.json');
        // var actual_JSON = JSON.parse(response);
        //This code finds the sms whitelist parameter and checks if its there
        whitelist_resource = policy.resources.find(resource_name => resource_name['name'] == 'sms_whitelist');
        // print(args)
        if (whitelist_resource === undefined) {
            return true;
        }
        return whitelist_resource.numbers.includes(args);
    }

    var bound_check = function(args) {
        if(sms_count < 3) {
            sms_count++;
            return true
        }
        return false
    }

    var sms_policy =  function(args,proceed,object)
    {
        var principal = thisPrincipal();
        alert("principal \' " + principal + "\' invokes sms.send");
        alert("!!!!!sms_policy!!!!!");
        var isAllowed = principal_permission_check(principal,"sms",args[0],operation="send");
        if(whitelist_check(args[0]) == false) {
            alert("whitelist failed");
            return
        }
        
        if(contact_read == true) {
            alert("cannot send sms after reading contacts");
            return
        }
        if(bound_check() == false) {
            alert("bound check failed");
            return
        }
        if(location_read == true){
            alert('cannot send SMS after reading location');
        }
        else if(isAllowed == true){
            return proceed();
        }
        else{
            alert("Access Not allowed");
        }
    }

    var fs_policy = function(args,proceed,object)
    {
        var principal = thisPrincipal();
        alert("principal \' " + principal + "\' invokes fileSystem read");
        var isAllowed = principal_permission_check(principal,"filesystem",args,operation="read")
        if(isAllowed){
            alert("!!!!!fs_policy!!!!!");
            return proceed();
        }
        return;
    }
    document.addEventListener("deviceready", enableMonitors, false);

    function enableMonitors(){
        HG_instance.monitorMethod(navigator.geolocation, "watchPosition", geolocation_policy);
        HG_instance.monitorMethod(navigator.geolocation, "getCurrentPosition", geolocation_policy);
        alert("Enable monitors");
    }

    function isJSURL(url){
        // //alert(url.split('.').pop().split(/\#|\?/)[0]);
        return url.split('.').pop().split(/\#|\?/)[0]==='js';
    }

    //CORS request
    //From: http://www.html5rocks.com/en/tutorials/cors/
    function createCORSRequest(method, url) {
        var xhr = new XMLHttpRequest();
        if ("withCredentials" in xhr) {

            // Check if the XMLHttpRequest object has a "withCredentials" property.
            // "withCredentials" only exists on XMLHTTPRequest2 objects.
            xhr.open(method, url, true);

        } else if (typeof XDomainRequest != "undefined") {

            // Otherwise, check if XDomainRequest.
            // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
            xhr = new XDomainRequest();
            xhr.open(method, url);

        } else {

            // Otherwise, CORS is not supported by the browser.
            xhr = null;

        }
        return xhr;
    }

    function getCORSContent(principal,url, unique_identifier) {
        var xhr = createCORSRequest('GET', url);
        if (!xhr) {
            //alert('CORS not supported');
            return;
        }
        var text;
        // Response handlers.
        xhr.onload = function() {
            text = xhr.responseText;
            //var title = getTitle(text);
             ////alert('Response from CORS request to '+principal+"-------" + url + ': ' + text);
            if (isJSURL(url)) {
                // //alert('JS file');
                HG_instance = HG.getInstance(unique_identifier);
                HG_instance.execScript(principal,text);
            }
        };

        xhr.onerror = function() {
            //alert('Woops, there was an error making the request.');
        };

        try{
            xhr.send(null);
            return text;
        }catch(e){
            irm_log("XMLHttpRequest error:"+e);
        }
        return '';

    }
    loadExternalJS=function(principal,url, unique_identifier){
        if(unique_identifier === undefined){
            unique_identifier = url.split(".")[0]+String(Date.now())+Math.floor(Math.random()*10000);
        }
        if(principal == "DEFAULT"){
            HG_instance = HG.getInstance(unique_identifier);
            HG_instance.setPrincipal(principal);    
        }else{
            getCORSContent(principal,url, unique_identifier);
        }
    }
    /*EXAMPLE
        //alert("Loading ALL using loadExternalJS");
        
        loadExternalJS('local', 'index.js', 'index');
        loadExternalJS('remote', 'general.js', 'general');
        
        //This should called after all the JS files 
        //To set document context
        //Anything loads from document is protected by CSP (Verified with Abhinav)
        
        setTimeout(function(){
            loadExternalJS('DEFAULT', 'document', 'document');
        }, 100);
    */
    loadExternalJS("local", "https:\\MSNWeather.js");
    loadExternalJS("local", "http:\\appType.js");
})();
