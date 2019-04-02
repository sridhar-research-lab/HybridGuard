# unpack.sh 
Unpacks apks in bulk present in a directory

# build_secure_apk.sh 
Unpacks, injects Hybridguard and repacks the apks. Needs user intervention to enter password for signing the APK (Yet to automate).

# build_bulk_secured_apks.sh 
Does the same as build_secure_apk.sh but in bulk.


# htmlParser.py
**Run this script** in the **www** directory of the app. The script expect **js** directory to be present in the current directory.

Run the script using the command
````
python htmlParser.py -f <html file> -hg <hybridGuard.js>
````
For detailed help, type
```
python htmlParser.py --help
```

# htmlParser2.0

**Run this script on the folder where apks are unpacked** The script will fetch the index.html from the subdirectories and add hybridGuard to js folder. Make sure policy_json is in the same folder as the hybrid guard

Run the script using the command
````
python htmlParser2.0.py -hg <hybridGuard.js>
````
For detailed help, type
```
python htmlParser.py --help
```
# addCSP.py
**Run this script to log CSP in the unpacked apks** 

The script will find the index.html and insert CSP and CSP Monitoring script and will send the data to the server. 

**Steps to follow** 

* Step 1: sudo apt install gawk
* Step 2: create a modified folder in the directory where there are unpacked apks
* Step 3: Add adb-run.sh , sign-apk.sh, udunccmobsec.keystore
* Step 4: Run the script . Make sure the password in the addCSP.py for signing apk is the same which you have used

```
  python addCSP.py
```


#### Requirements for the python script:
* BeautifulSoup `sudo pip install bs4`
* shutils `sudo pip install shutils`
A sample run is shown [here](https://github.com/cyanide284/HybridGuard_TestApp/blob/master/Tools/sample_run.txt)



# REQUIREMENTS:
* `apktool` must be installed and should be available globally.
* A keystroke file must be present to sign the APK. Can be generated using the command ```keytool -alias ud-uncc-mobsec -genkey -v -keystore ud-uncc-mobsec.keystore -keyalg RSA -keysize 2048 -validity 10000```
----

# AUTHOR
* [Rahul Rachapalli](https://github.com/rahulr56)
