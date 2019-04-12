import os

def fetchHtml(path):
    dirs = os.listdir()
    index_dirs = []
    non_index_dirs = []

    for dir1 in dirs:
        # dir1 = os.path.abspath(dir1)
        if os.path.isdir(dir1):
            print(dir1)
            subfolders = [f.path for f in os.scandir(dir1) if f.is_dir() ]
            for subfolder in subfolders :
                if "assets" in subfolder :
                    www_path = [f.path for f in os.scandir(subfolder) if f.is_dir() ]
                    for www in www_path :
                        print(www.split("\\")[-1])
                        if "www" == www.split("\\")[-1] :
                            www_path = [f.path for f in os.scandir(www)]
                            #check for index html
                            print(www_path)
                            for index in www_path :
                                if 'index.html' in index :
                                    index_dirs.append(os.path.abspath(index))
                                else :
                                    non_index_dirs.append(dir1)
    print(index_dirs)
    return index_dirs


import xml.etree.ElementTree as etree
def getPermissionList(manifest_path):
    etree.register_namespace('android', 'http://schemas.android.com/apk/res/android')
    # manifest_path = 'D:\\RA\\Upacked_Downloaded_APKs\\Second_Set\\air.com.KickstandTech.MotorcycleWeather\\AndroidManifest.xml'

    with open(manifest_path, 'r') as handle:
        tree = etree.parse(handle)
        root = tree.getroot()

    permissionList = []
    for perm in root.findall('uses-permission'):
        permissionList.append(perm.attrib['{http://schemas.android.com/apk/res/android}name'])

    return permissionList


import json
def getJSONPluginMap():
    with open('plugin_api_map.json') as json_file:  
        data = json.load(json_file)
    return data

def getPolicies(path):
    policy_json = getJSONPluginMap()
    anodroid_permissions = getPermissionList(path+"AndroidManifest.xml")
    no_resource_list = []
    all_policy = []
    permissions_used = []
    plugin = ""
    for resource in policy_json['resource_map']:
        permissions = resource['android_permissions']
        print("\nPermissions : ",permissions)
        if permissions[0] in anodroid_permissions:
            for api in resource["APIs"]:
                policy = []
                method = api.split(".")[-1]
                policy.append(".".join(api.split(".")[:-1]))
                policy.append(method)
                policy.append(resource["policy"])
                permissions_used.append(policy).append(permissions[0])
                plugin = resource["cordova_plugin"]
    print("\nPOLICIES : ",all_policy)
    return all_policy,permissions_used,cordova_plugin

# if __name__ == '__main__':
#     getPolicies("")
