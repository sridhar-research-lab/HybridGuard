#!/bin/bash
if [ -z $1 ]
then
    $1=$(pwd)
fi
cat >  rename_apks.py << EOF
import os
print ("Reading all apks in the dir " + os.getcwd())
apks =[]
for root, dirs, files in os.walk("$1"):
    apks  = files
    print (files)

print ("Renaming all apks in the dir " + os.getcwd())
for apk in apks:
    if apk.endswith('apk'):
        new_apk_name = apk.replace(' ', '_').replace('.', '_').replace('_apk', '.apk')
        print("Renaming {} to {}".format(apk, new_apk_name))
        os.rename(apk, new_apk_name)

print ("All apks in current dir: ")
for root, dirs, files in os.walk('.'):
    apks  = files
    for apk in apks:
        if apk.endswith('apk'):
            print (apk)
EOF
python rename_apks.py
if [ $? != 0 ];then
    echo "Error in executing python script"
    exit -1
fi
rm rename_apks.py

for apk in $(\ls *.apk)
do
    echo "Unpacking the apk : ${apk}"
    java -jar ../Dump/APKtool_setup/apktool.jar d -s -f "$apk"
done

echo "Unpacked all APKs"
