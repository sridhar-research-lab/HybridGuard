APKfile=$1
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
jarsigner -verbose -keystore ud-uncc-mobsec.keystore -storepass udunccmobsec $APKfile ud-uncc-mobsec
#alternative cmd:
#java -jar ~/tools/signapk.jar certificate.pem key.pk8 irm_$APKfile  signed_irm_$APKfile