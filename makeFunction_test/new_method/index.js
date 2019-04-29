function makeFunction(body) {
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
    // return new Function(body);
    return body;
}

