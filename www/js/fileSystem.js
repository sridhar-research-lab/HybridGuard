document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady()
{
    document.querySelector("#createFile").addEventListener("touchend",sendMessage , false);
    function sendMessage()
    {
        alert("In file system");
        // window.requestFileSystem(type, size, successCallback, errorCallback);
        //
        // function successCallback(fs) {
        //     fs.root.getFile('log.txt', {create: true, exclusive: true}, function(fileEntry) {
        //         alert('File creation successfull!')
        //     }, errorCallback);
        // }
        //
        window.requestFileSystem(window.TEMPORARY, 5 * 1024 * 1024, function (fs) {

            console.log('file system open: ' + fs.name);
            alert('file system open: ' + fs.name);
            createFile(fs.root, "newTempFile.txt", false);
            alert("File created, waiting for result");
        }, onErrorLoadFs);
    }

    function onErrorLoadFs(error) {
        alert("ERROR CODE: " + error.code+
        "\n ERROR MESSAGE : "+error.message);
    }
    function createFile(dirEntry, fileName, isAppend) {
        // Creates a new file or returns the file if it already exists.
        dirEntry.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {
            writeFile(fileEntry, null, isAppend);
            alert("successfull in creeating a file");
        }, onErrorCreateFile);

    }
    function writeFile(fileEntry, dataObj) {
        // Create a FileWriter object for our FileEntry (log.txt).
        fileEntry.createWriter(function (fileWriter) {
            fileWriter.onwriteend = function() {
                console.log("Successful file write...");
                alert("Successful file write...");
                readFile(fileEntry);
            };

            fileWriter.onerror = function (e) {
                console.log("Failed file write: " + e.toString());
                alert("Failed file write: " + e.toString());
            };

            // If data object is not passed in,
            // create a new Blob instead.
            if (!dataObj) {
                dataObj = new Blob(['some file data'], { type: 'text/plain' });
            }

            fileWriter.write(dataObj);
        });
    }
    function readFile(fileEntry) {
        fileEntry.file(function (file) {
            var reader = new FileReader();

            reader.onloadend = function() {
                console.log("Successful file read: " + this.result);
                alert("Successful file read: " + this.result);
                displayFileData(fileEntry.fullPath + ": " + this.result);
            };
            reader.readAsText(file);
        }, onErrorReadFile);
    }
}
