import os
import pdb
import re
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

    parser = argparse.ArgumentParser(description='Process some integers.')
    # parser.add_argument('--input_html', '-i', dest='input_html',
    #                     nargs=1, metavar='HTML FILE', required=True,
    #                     help='Input HTML file to parse')
    parser.add_argument('--hybrid_guard', '-hg', dest='hybrid_guard_file',
                        nargs=1, metavar='HTML FILE', required=True,
                     help='Input Hybrid Guard file to add script tags')
    args = parser.parse_args()
    return args   


def open_read_lines(file_name):
    with open(file_name, 'r') as f:
       text = f.readlines()
    return text

if __name__ == '__main__':
    args = parse_cmd_opts()
    dirs = fetchHtml()
    for input_html in dirs :
        html_body = ''.join(open_read_lines(input_html))
        html_soup = BeautifulSoup(html_body, 'html.parser')
        # print (html_soup.prettify())
        all_script_tags = html_soup.find_all('script')

        print("List of JS files in the html: {}".format(input_html))
        hg_funcs = list()
        import re
        # js_whitelist = ['cordova', 'jQuery']
        # whitelist_pattern = re.compile('(' + '|'.join(js_whitelist) + ')', re.I)
        # print(whitelist_pattern)
        
        file_index=0
        input_html_splitted = input_html.split("\\")
        path_to_hybrid = ("\\").join(input_html_splitted[:-1])
        input_html_splitted[-1] = 'original_' + input_html_splitted[-1]
        input_html_splitted = ("\\").join(input_html_splitted)
        # pdb.set_trace()
        hybrid_guard_js = path_to_hybrid + "\\js\\HybridGuard.js"
        # pdb.set_trace()
        print(hybrid_guard_js)
        js_directory= path_to_hybrid+"\\js\\"
        
        with open(hybrid_guard_js) as f:
            hg_file_contents = f.readlines()
        externalJS = [item for i, item in enumerate(hg_file_contents) if 'loadExternalJS(' in item]
        os.remove(hybrid_guard_js)
        shutil.copyfile(args.hybrid_guard_file[0], hybrid_guard_js)
        with open(hybrid_guard_js) as f:
            hg_file_contents = f.readlines()

        last_index=hg_file_contents.index('})();\n')
        if not last_index:
            print ("Unable to find the pattern })();\\n in the HG file : {}".format(hybrid_guard_js))
            exit(-1)
        for js in externalJS:
            hg_file_contents.insert(last_index,js) 
        print(hg_file_contents)
        with open(hybrid_guard_js, 'w') as f:
            f.write(''.join(hg_file_contents))
        # break
        # if not os.path.exists(js_directory):
        #     os.makedirs(js_directory)
        #     print("No js/ folder. creating one.")
        # for script in all_script_tags:
        #     src = script.get('src')
        #     if src and re.search(whitelist_pattern, src):
        #         continue            # Skip if the file has whitelisted contents
        #     elif src:
        #         # Move the file name to FlashJax
        #         hg_funcs.append(src)
        #         print (src)
        #         script.decompose()
            # else:
            #     # Get inline JS
            #     # Write JS to a new file
            #     from datetime import datetime as d
            #     file_index += 1
            #     curr_time = d.now().strftime('%d_%m_%Y_%H_%M_%S')
            #     inline_file_name = 'js\\inline_'+ curr_time + '_'+str(file_index)+'.js'
            #     print ("-------------------------------------------------------------------------------------------------------")
            #     print ("Found some inline JS. Making a new file {} and including it in Hybrid Guard.\nCode in inline JS is:".format(inline_file_name))
            #     print (''.join(script.contents))
            #     print ("-------------------------------------------------------------------------------------------------------")
            #     with open(path_to_hybrid +"\\"+ inline_file_name, 'w') as f:
            #         f.write(''.join([x.strip() for x in script.contents]) + '\n')
            #     hg_funcs.append(inline_file_name.replace("\\","/"))

        # new_tag = html_soup.new_tag("script", src="js/HybridGuard.js")
        # html_soup.head.append(new_tag)
        # print ("Backing up {} to {}".format(input_html, input_html_splitted))
        # os.rename(input_html, input_html_splitted)
        # with open(input_html, 'w') as f:
        #     f.write(str(html_soup))

        # print("Copying HybridGuard.js and policy_config.json to js/ : {}".format(args.hybrid_guard_file[0]))
        # shutil.copyfile(args.hybrid_guard_file[0], hybrid_guard_js)
        # package_json_file = re.sub('HybridGuard.js', 'policy_config.json', args.hybrid_guard_file[0])
        # print("\nPackage_config.json path : {}".format(package_json_file))
        # shutil.copyfile(package_json_file, path_to_hybrid + "\\js\\policy_config.json")
        # print ("Modifying Hybrid Guard file:{}".format(hybrid_guard_js))
        # with open(hybrid_guard_js) as f:
        #     hg_file_contents = f.readlines()

        # last_index=hg_file_contents.index('})();\n')
        # if not last_index:
        #     print ("Unable to find the pattern })();\\n in the HG file : {}".format(hybrid_guard_js))
        #     exit(-1)
        # func_hg = '    loadExternalJS("local", "{}");\n'

        # for js in hg_funcs:
        #     hg_file_contents.insert(last_index, func_hg.format(js)) 
        # print("Backing up the original Hybrid Guard file {} to {}".format(hybrid_guard_js, hybrid_guard_js + '.bak'))
        # shutil.copyfile(hybrid_guard_js, hybrid_guard_js + '.bak')
        # with open(hybrid_guard_js, 'w') as f:
        #         f.write(''.join(hg_file_contents))
        # print("Modified Hybrid Guard file:{}".format(hybrid_guard_js))


