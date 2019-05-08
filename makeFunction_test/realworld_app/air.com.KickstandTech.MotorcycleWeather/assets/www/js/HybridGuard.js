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
                // console.log(HGInstances[instance_key]);
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
                while (object !=undefined && !hasOwnProperty.call(object, method) && object.__proto__)
                object = object.__proto__;
                if (object === null){
                    return;
                    // throw new Error('Failed to find function for alias ' + method);
                }
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
                // console.log("eventlistner policy principal : "+ principal)
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
    document.addEventListener("deviceready", enableMonitors, false);

    function enableMonitors(){
        alert("Enable monitors");
    }

    var functionTracker = {};
    functionTracker.log = true;//Set this to false to disable tracking 

    /**
     * Gets a function that when called will log information about itself if tracking is turned on.
     *
     * @param func The function to add tracking to.
     * @param name The name of the function.
     *
     * @return A function that will perform tracking and then call the function. 
     */
    functionTracker.getTrackableFunction = function(func, name) {
        return function() {
            if (functionTracker.log) {
                var logText = name + '(';

                for (var i = 0; i < arguments.length; i++) {
                    if (i > 0) {
                        logText += ', ';
                    }
                    logText += arguments[i];
                }
                logText += ');';
                this.principal = "remote";
                principal = "remotes";
                HG_instance.setPrincipal("remotesss");
                console.log(logText);
            }

            return func.apply(this, arguments);
        }
    };

    var excludedFunctions = {};
    var includedFunctions = [];
    functionTracker.excludeTrackingToNamespace = function(namespaceObject){
        for(var name in namespaceObject){
            var potentialFunction = namespaceObject[name];

            if(Object.prototype.toString.call(potentialFunction) === '[object Function]') {
                excludedFunctions[name] = name;
            }
        }
    };
    functionTracker.addTrackingToNamespace = function(namespaceObject){
        for(var name in namespaceObject){
            var potentialFunction = namespaceObject[name];
    
            if(Object.prototype.toString.call(potentialFunction) === '[object Function]' && 
               !excludedFunctions[name]) {
                   alert(name);
                includedFunctions.push(name);
                namespaceObject[name] = functionTracker.getTrackableFunction(potentialFunction, name);
            }
        }
    };    
    loadExternalJS=function(principal, url){
        var success_callback = function(){alert("success: script loaded")}
        var error_callback = function(){alert("error loading script")}
        var DOMlocation = document.head;
        HG_instance = HG.getInstance(url);
        HG_instance.setPrincipal(principal);
        alert("Start");
        
        var scriptTag = document.createElement('script');
        scriptTag.src = url;
        scriptTag.type = "text/javascript";
        scriptTag.onload = success_callback;
        scriptTag.onerror = error_callback;
        scriptTag.onreadystatechange = success_callback;
        
        // alert(document.currentScript.src)
        
        functionTracker.excludeTrackingToNamespace(window);
        DOMlocation.appendChild(scriptTag);
        functionTracker.addTrackingToNamespace(window);
    }
    var callback_fn = function(){
        //your code goes here
        alert("script After loaded");
        functionTracker.addTrackingToNamespace(window);
        alert(includedFunctions);
        console.log("excludedFunctions : ", excludedFunctions);
        console.log("includedFunctions : ", includedFunctions);
    }
    //To make changes to this file - https://github.com/ramvinoth/hgtesting/blob/master/custom_thirdparty.js
    // loadExternalJS('js/controllers.js', callback_fn, document.head, "local");
    // loadExternalJS('https://cdn.jsdelivr.net/gh/ramvinoth/hgtesting/custom_thirdparty.js', callback_fn, document.head, "remote");
   
})();