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
    try :
        with open(file_name, 'r',encoding="utf8") as f:
           text = f.readlines()
        return text
    except :
        return ""

if __name__ == '__main__':
    args = parse_cmd_opts()
    dirs = fetchHtml()
    for input_html in dirs :
        html_body = ''.join(open_read_lines(input_html))
        html_soup = BeautifulSoup(html_body, 'html.parser')
        # print (html_soup.prettify())
        all_script_tags = html_soup.find_all('script')

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
        hybrid_guard_js = path_to_hybrid + "\\js\\HybridGuard.js"
        # pdb.set_trace()
        js_directory= path_to_hybrid+"\\js\\"
        

        if not os.path.exists(js_directory):
            os.makedirs(js_directory)
            # print("No js/ folder. creating one.")
        for script in all_script_tags:
            src = script.get('src')
            if src and re.search(whitelist_pattern, src):
                continue            # Skip if the file has whitelisted contents
            elif src:
                # Move the file name to FlashJax
                hg_funcs.append(src)
                # print (src)
                if ('http' in src) or ('www' in src) or ('.com' in src) :
                    print(input_html.split("\\")[-4])
                    break
        #                 if(s.contains("http")) return true;
        # else if(s.contains("https")) return true;
        # else if(s.contains("://www")) return true;
        # else if(s.contains("www.")) return true;
        # else if(s.contains(".com")) return true;


