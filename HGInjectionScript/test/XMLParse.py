import xml.etree.ElementTree as etree

etree.register_namespace('android', 'http://schemas.android.com/apk/res/android')

with open('D:\\RA\\Upacked_Downloaded_APKs\\First_Set\\Basket_USA_v1.5.13_apkpure.com\\AndroidManifest.xml', 'r') as handle:
    tree = etree.parse(handle)
    root = tree.getroot()

# for child in root:
#     print(child.tag, child.attrib)

for perm in root.findall('uses-permission'):
    # permission = perm.find('android-name').text
    print(perm.attrib['{http://schemas.android.com/apk/res/android}name'])

# permission = root.find('uses-permission').get('android:name')
# print(permission)
# root.write('parsed.xml', encoding='utf-8', xml_declaration=True)