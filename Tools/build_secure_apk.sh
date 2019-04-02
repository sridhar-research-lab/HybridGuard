#!/bin/bash

if [ $# -lt 2 ];then
    echo "USAGE: $0 <apkfile> <hybridGuard.js File>"
    exit -1
fi

original_apk="$1"
hybridGuardFile="$2"

echo "Decompiling the APK file : ${original_apk}"
apktool d -s -f "$original_apk"
apk_dir=$(echo "$original_apk" | rev | cut -d'.' -f1 --complement | rev)
assets_dir=$(find "$apk_dir" -name 'assets' -type d)
www_dir="${assets_dir}/www"

echo "$apk_dir"
echo "$www_dir"

echo "Copying htmlParser.py and $hybridGuardFile into $www_dir"
cmd="cp  -v htmlParser.py $hybridGuardFile $www_dir"
echo "Executing the command : ${cmd}"
$cmd
if [ $? != 0 ];then
    echo "Error in copying filrs, exitting..."
    exit 1
fi
curr_dir=$(pwd)
cd "$www_dir"
echo"Changing dir  to ${www_dir}"
python htmlParser.py -i index.html -hg "$hybridGuardFile"
rm htmlParser.py
cd "$curr_dir"

secured_apk_name="secured_${original_apk}"
echo "Repacking the ${original_apk} to ${secured_apk_name}"
apktool b "$apk_dir" -o "$secured_apk_name"
echo "Signing the APK file : ${secured_apk_name}"
./sign-apk.sh "$secured_apk_name"

echo "Checking if the certificate exists..."
if [ -f ud-uncc-mobsec.keystore ] ; then
    echo "Using existing 'ud-uncc-mobsec.keystore' certificate..."
else
    echo "ud-uncc-mobsec.keystore does not exists."
    echo "Use the following cmd to generate the certificate:"
    echo "keytool -alias ud-uncc-mobsec -genkey -v -keystore ud-uncc-mobsec.keystore -keyalg RSA -keysize 2048 -validity 10000"
    exit 0;
fi
echo "Signing the new apk file"
jarsigner -verbose -keystore ud-uncc-mobsec.keystore "${secured_apk_name}" ud-uncc-mobsec
#alternative cmd:
#java -jar ~/tools/signapk.jar certificate.pem key.pk8 irm_$APKfile  signed_irm_$APKfile
