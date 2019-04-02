import os
import pdb
def fetchHtml():
    dirs = os.listdir()

    index_dirs = []
    non_index_dirs = []
    for dir1 in dirs:
        if dir1.split(".")[-1] != "apk" and dir1.split(".")[-1] != "sh" and dir1.split(".")[-1] != "py" :
            subfolders = [f.path for f in os.scandir(dir1) if f.is_dir() ]
            for subfolder in subfolders :
                if "assets" in subfolder :
                    www_path = [f.path for f in os.scandir(subfolder) if f.is_dir() ]
                    for www in www_path :
                        # pdb.set_trace()
                        if "www" == www.split("\\")[-1] :
                            www_path = [f.path for f in os.scandir(www)]
                            #check for index html
                            for index in www_path :
                                if 'index.html' in index :
                                    # print(index)
                                    # pdb.set_trace()
                                    index_dirs.append(os.path.abspath(index))
                                else :
                                    non_index_dirs.append(dir1)

    # print(index_dirs)
    return index_dirs
# print(non_index_dirs)
                    
#!/bin/python

import os
import shutil
import argparse
try:
    from BeautifulSoup import BeautifulSoup
except ImportError:
    from bs4 import BeautifulSoup


def parse_cmd_opts():
    pass
    # parser = argparse.ArgumentParser(description='Process some integers.')
    # # parser.add_argument('--input_html', '-i', dest='input_html',
    # #                     nargs=1, metavar='HTML FILE', required=True,
    # #                     help='Input HTML file to parse')
    # parser.add_argument('--hybrid_guard', '-hg', dest='hybrid_guard_file',
    #                     nargs=1, metavar='HTML FILE', required=True,
    #                  help='Input Hybrid Guard file to add script tags')
    # args = parser.parse_args()
    # return args   


def open_read_lines(file_name):
    text = ""
    try :
        with open(file_name, 'r') as f:
           text = f.readlines()
    except:
        print(f'Error: {file_name}')
        return False
    return text

if __name__ == '__main__':
    args = parse_cmd_opts()
    dirs = fetchHtml()
    uninstall_list = []
    for input_html in dirs :
        lines = open_read_lines(input_html)
        if lines == False :
            continue
        html_body = ''.join(lines)
        html_soup = BeautifulSoup(html_body, 'html.parser')
        # print (html_soup.prettify())
        all_script_tags = html_soup.find_all('head')
        # print("List of JS files in the html: {}".format(input_html))
        hg_funcs = list()
        import re
        js_whitelist = ['cordova', 'jQuery']
        whitelist_pattern = re.compile('(' + '|'.join(js_whitelist) + ')', re.I)
        # print(whitelist_pattern)
        
        file_index=0
        input_html_splitted = input_html.split("\\")
        path_to_hybrid = ("\\").join(input_html_splitted[:-1])
        input_html_splitted[-1] = 'original_' + input_html_splitted[-1]
        input_html_splitted = ("\\").join(input_html_splitted)
        # pdb.set_trace()
        script_soup = BeautifulSoup('<meta http-equiv="Content-Security-Policy" content="default-src \'self\' data: gap: https://ssl.gstatic.com ;script-src \'self\' \'nonce-2726c7f26c\';style-src \'self\'; media-src * ; connect-src https://dry-meadow-56957.herokuapp.com ; ">','html.parser')
        # pdb.set_trace()
        html_soup.head.insert(1,script_soup)
        package_hg= '    var package_name="{}";\n'
        tag = html_soup.new_tag("script")
        tag.append(package_hg.format(path_to_hybrid.split("\\")[-3]))
        # tag.append(' document.addEventListener("securitypolicyviolation", (e) => {\n')
        # tag.append('if(e.violatedDirective != "style-src-attr" && e.violatedDirective != "style-src-elem"){\n')
        # tag.append('alert(e.blockedURI);\n')
        # tag.append('alert(e.violatedDirective);\n')
        # tag.append('alert(e.originalPolicy);\n')
        # tag.append('xhttp.open("POST", "https://dry-meadow-56957.herokuapp.com/log_csp_data?appname="+package_name+"&errors="+e.violatedDirective+":"+e.blockedURI+", true);\n')
        # tag.append("xhttp.send();\n")
        # tag.append(';} } )\n')
        tag.append('var listofErrors = []\n')
        tag.append('document.addEventListener("securitypolicyviolation", (e) => {\n')
        tag.append('if (e.violatedDirective != "style-src-attr" && e.violatedDirective != "style-src-elem"){\n')
        tag.append('listofErrors.push(encodeURI(e.violatedDirective)+":"+encodeURI(e.blockedURI))\n')
        tag.append('}\n')
        tag.append('})\n')
        tag.append('window.onload = function(e){ \n')
        tag.append('var xhttp = new XMLHttpRequest()\n')
        tag.append('xhttp.open("POST", "https://dry-meadow-56957.herokuapp.com/log_csp_data?appname="+package_name+"&errors="+listofErrors.join(","), true);\n')
        tag.append('xhttp.send();\n')
        tag.append('\n')
        tag.append('}\n')

        tag['nonce']= "2726c7f26c"
        html_soup.head.append(tag)

        print ("Backing up {} to {}".format(input_html, input_html_splitted))
        os.rename(input_html, input_html_splitted) 
        apk_name = input_html.split("\\")[-4]
        try :
            with open(input_html, 'w') as f:
                f.write(str(html_soup))
            print('Added CSP')
            os.system(f'apktool b {apk_name} -o modified/{apk_name}.apk')
            old_path = os.getcwd()
            os.chdir(old_path +'/modified')
            # os.system('cd modified')
            os.system(f'printf "udunccmobsec" | sh sign-apk.sh {apk_name}.apk')
            os.system(f'adb install -r {apk_name}.apk')
            pkg_name = os.popen(f'sh adb-run.sh {apk_name}.apk').read().replace('\n','')
            os.system(f'adb shell monkey -p {pkg_name} 1')
            uninstall_list.append(pkg_name)
            # os.system('cd ..')
            os.chdir(old_path)
        except Exception as e:
            print(f'Error: Failed to insert csp on {apk_name} : {e}')
    for pkg_name in uninstall_list :
        os.system(f'adb uninstall {pkg_name}')
        # if not os.path.exists(js_directory):
        #     os.makedirs(js_directory)
        #     # print("No js/ folder. creating one.")
        # for script in all_script_tags:
        #     src = script.get('head')
        #     if src and re.search(whitelist_pattern, src):
        #         continue            # Skip if the file has whitelisted contents
        #     elif src:
        #         # Move the file name to FlashJax
        #         hg_funcs.append(src)
        #         # print (src)
        #         if ('http' in src) or ('www' in src) or ('.com' in src) :
        #             print(input_html.split("\\")[-4])
        #             break
        # #                 if(s.contains("http")) return true;
        # else if(s.contains("https")) return true;
        # else if(s.contains("://www")) return true;
        # else if(s.contains("www.")) return true;
        # else if(s.contains(".com")) return true;


