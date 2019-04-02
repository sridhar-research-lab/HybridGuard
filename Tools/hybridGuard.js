(function(){
    var debug = true;
    //constant will not allow the policy to get modified by the attacker while the script is executing.
    const policy = JSON.parse(get_URL('js/policy_config.json'))

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

    function makeFunction(body) {
        if(body===undefined) throw new Error('makeFunction error: No code to make a function.');
        var locals = body.match(/function\s+\w+\(/g);
            if (locals) {
                body += ';';
                for (var i=0; i<locals.length; ++i) {
                    var fname = locals[i].slice(8).match(/\w+/);
                    body += 'if(typeof('+fname+')!="undefined")window.'+fname+'='+fname+';';
                }
            }
            //irm_log("makeFunction, body="+irm_log;)
            return new Function(body);
        }

    // Implement a shadow stack as a list.
    var shadowStack = [];

    // Other code may read (but not write) the current principal.
    thisPrincipal = function(){
        if (shadowStack.length<1) return ''; else
            return shadowStack[shadowStack.length-1];
    };

    // This protected function executes code f at the privileges of a
    // specified principal.
    //revised version supporting AS calls
    function execWith(principal,f) {

        ////alert("execWith -> principal= " + principal);

        // //alert("execWith -> principal= " + principal);
        if(f===undefined) return;

        ////alert("execWith -> code= " + f.toString());
        if ((principal == '') || (principal === '') || (principal == undefined))
        {
            shadowStack.push('undefined_principal');
        }
        else
        {
            shadowStack.push(principal);
        }
        //ensure to call original apply function
        f.apply = builtins.Function.apply;
        try
        {
            var r = f.apply(this,$Array.prototype.slice.call(arguments,2));
        }catch(e)
        {
            //alert(e.stack);
            console.log('exception occurred in execWith with the principal :'+ principal);
        }
        shadowStack.pop();
        //flush_write(principal);
        if (typeof r !== "undefined") return r;
    }

    function execScript(principal, dynamic_script_code){
        var dynamic_script = makeFunction(dynamic_script_code); // call our code for turning a string into a global-scoped function
        execWith(principal,dynamic_script);
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
            throw new Error('No method ' + method +'found for '+object);
        //make sure to call the original apply function
        original.apply = builtins.Function.apply;
        ////alert("inside monitor method - method : "+method+" orgArgs : "+orgArgs+" object : "+object);
        object[method] = function wrapper() {
            var object = this;
            var orgArgs = arguments;
            var proceed = function() {
                return original.apply(object, orgArgs);
            };
            return policy(orgArgs, proceed,object);
        }
    }

    /*
    var querySelector_policy = function(args, proceed, node) {
        var principal = thisPrincipal();
            //alert("principal \' " + principal + "\' element.querySelector");

        var element = proceed();
        monitorMethod(element, 'addEventListener', addEventListener_policy);
        return element;
    };
    var addEventListener_policy = function(args, proceed, node) {
            //interface
        var principal = thisPrincipal();
        var listener = args[1];
        args[1] = function(){ return execWith(principal,listener)};
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
    */
            //===========================Loading the policy_config.json=========================================

            function get_URL(url){
                var xhr = new XMLHttpRequest();
                try{
                    var fileSrc;
                    xhr.open('GET',url,false);
                    xhr.onreadystatechange = function() {
                        ////alert('this.readyState='+this.readyState+';this.status='+this.status+'this.responseXML='+this.responseXML);
                        if (this.readyState === 4 && this.status == 200) {
                            fileSrc = this.responseText;
                        }
                    }
                    try{
                        xhr.send(null);
                        return fileSrc;
                    }catch(e){
                        console.log('exception occurred while retrieving the url: ' + url + ' exception:  '+e);
                        //alert(e);
                    }
                }catch(e){
                    console.log('exception occurred while retrieving the url: ' + url + ' exception:  '+e);
                    //alert(e.stack);
                }
                return '';
            }
    //==========================POLICY CHECK========================================
    var principal_permission_check = function(principal,method,args){
        var resource = "";
        // var response = get_URL('js/policy_config.json');
        // var policy = JSON.parse(response);
        //alert("Inside policy check - principal -> "+principal);
        for(i=0;i<policy.resources.length;i++){
            if(policy.resources[i].name == method.toString()){
                resource = policy.resources[i].name;
                for(j=0;j<policy.resources[i].permissions.length;j++){
                    if(policy.resources[i].permissions[j].principal_id == principal.toString()){
                        //alert("Inside policy check");
                        if(policy.resources[i].permissions[j].send == "true"){
                            // result = sms_policy_check(resource,args,policy);
                            ////alert(result + 'after policy check');
                            return true;
                            ////alert(result + 'after policy check');
                        }
                        else if(policy.resources[i].permissions[j].read == "true"){
                            //alert('inside else if geolocation');
                            return true;
                        }
                        else{
                            //alert('inside else');
                            return false;
                        }
                    }
                }
            }
        }
        return false;
    }
    //=============================================================================================

    var geolocation_policy = function(args, proceed, object) {
        var principal = thisPrincipal();
        //alert("!!!!!        geolocation_policy        !!!!!");
        //alert("principal \' " + principal + "\' invokes navigator.geolocation.getCurrentPosition");
        var isAllowed = principal_permission_check(principal,"geolocation",args);
        if(isAllowed == true){
            location_read = true;
            return proceed();//run the original method
        }
        else{
            //alert("Access not allowed");
        }
    };

    document.addEventListener("deviceready", enableMonitors, false);

    function enableMonitors()
    {
        //alert("enableMonitors");
        monitorMethod(navigator.geolocation, 'getCurrentPosition', geolocation_policy);
    }

    function isJSURL(url){
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

    function getCORSContent(principal,url) {
        var xhr = createCORSRequest('GET', url);
        if (!xhr) {
            //alert('CORS not supported');
            return;
        }
        var text;
        xhr.onload = function() {
            text = xhr.responseText;
            ////alert('Response from CORS request to '+principal+"-------" + url + ': ' + text);
            if (isJSURL(url)) {
                //alert('JS file');
                execScript(principal,text);
            }else{
                execScript(principal,text);
            }
        };

        xhr.onerror = function() {
            //alert('Woops, there was an error making the request.');
        };

        try{
            xhr.send(null);
            return text;
        }catch(e){
            console.log("XMLHttpRequest error:"+e);
        }
        return '';

    }
    loadExternalJS=function(principal,url){
        getCORSContent(principal,url);
    }

    /********************** LOAD EXTERNAL JS HERE ****************************/
    //loadExternalJS("location","http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0");
    loadExternalJS("location", "js/external-test.js");
})();

