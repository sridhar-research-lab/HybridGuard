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


# def parse_cmd_opts():

#     parser = argparse.ArgumentParser(description='Process some integers.')
#     # parser.add_argument('--input_html', '-i', dest='input_html',
#     #                     nargs=1, metavar='HTML FILE', required=True,
#     #                     help='Input HTML file to parse')
#     parser.add_argument('--hybrid_guard', '-hg', dest='hybrid_guard_file',
#                         nargs=1, metavar='HTML FILE', required=True,
#                      help='Input Hybrid Guard file to add script tags')
#     args = parser.parse_args()
#     return args   


def open_read_lines(file_name):
    with open(file_name, 'r') as f:
       text = f.readlines()
    return text

if __name__ == '__main__':
    # args = parse_cmd_opts()
    dirs = fetchHtml()
    for input_html in dirs :
        html_body = ''.join(open_read_lines(input_html))
        html_soup = BeautifulSoup(html_body, 'html.parser')
        # print (html_soup.prettify())
        input_html_splitted = input_html.split("\\")
        path_to_hybrid = ("\\").join(input_html_splitted[:-1])
        input_html_splitted[-1] = 'original_' + input_html_splitted[-1]
        input_html_splitted = ("\\").join(input_html_splitted)

        head = html_soup.find('head')
        package_hg= '    var package_name="{}";\n'

        # pdb.set_trace()
        tag = html_soup.new_tag("script")
        tag.append("    window.addEventListener('load',function(){\n")
        tag.append("var download_from_server = (window.performance.timing.responseEnd - window.performance.timing.navigationStart);\n")
        tag.append("var time_to_render= (window.performance.timing.loadEventStart - window.performance.timing.domLoading);\n")
        tag.append("var dom_event = (window.performance.timing.domComplete - window.performance.timing.domInteractive);\n")
        tag.append("var xhttp = new XMLHttpRequest();\n")
        tag.append(package_hg.format(path_to_hybrid.split("\\")[-3]))
        tag.append('xhttp.open("POST", "https://dry-meadow-56957.herokuapp.com/log_load_times?app_name="+package_name+"&download_from_server_wo_hg="+download_from_server+"&render_webpage_wo_hg="+time_to_render+"&dom_wo_hg="+dom_event, true);\n')
        tag.append("xhttp.send();\n")
        tag.append("},false);\n")
        head.insert_after(tag)

        print ("Backing up {} to {}".format(input_html, input_html_splitted))
        os.rename(input_html, input_html_splitted)
        with open(input_html, 'w') as f:
            f.write(str(html_soup))


        # all_script_tags = html_soup.find_all('script')

        # print("List of JS files in the html: {}".format(input_html))
        # hg_funcs = list()
        # import re
        # js_whitelist = ['cordova', 'jQuery']
        # whitelist_pattern = re.compile('(' + '|'.join(js_whitelist) + ')', re.I)
        # print(whitelist_pattern)
        
        # file_index=0
        # # pdb.set_trace()
        # hybrid_guard_js = path_to_hybrid + "\\js\\HybridGuard.js"
        # # pdb.set_trace()
        # js_directory= path_to_hybrid+"\\js\\"
        

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
        #     else:
        #         # Get inline JS
        #         # Write JS to a new file
        #         from datetime import datetime as d
        #         file_index += 1
        #         curr_time = d.now().strftime('%d_%m_%Y_%H_%M_%S')
        #         inline_file_name = 'js\\inline_'+ curr_time + '_'+str(file_index)+'.js'
        #         print ("-------------------------------------------------------------------------------------------------------")
        #         print ("Found some inline JS. Making a new file {} and including it in Hybrid Guard.\nCode in inline JS is:".format(inline_file_name))
        #         print (''.join(script.contents))
        #         print ("-------------------------------------------------------------------------------------------------------")
        #         with open(path_to_hybrid +"\\"+ inline_file_name, 'w') as f:
        #             f.write(''.join([x.strip() for x in script.contents]) + '\n')
        #         hg_funcs.append(inline_file_name.replace("\\","/"))
        #     script.decompose()

        # new_tag = html_soup.new_tag("script", src="js/HybridGuard.js")
        # html_soup.head.append(new_tag)

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
        # # pdb.set_trace()
        # hg_file_contents.insert(last_index,package_hg.format)
        # print("Backing up the original Hybrid Guard file {} to {}".format(hybrid_guard_js, hybrid_guard_js + '.bak'))
        # shutil.copyfile(hybrid_guard_js, hybrid_guard_js + '.bak')
        # with open(hybrid_guard_js, 'w') as f:
        #         f.write(''.join(hg_file_contents))
        # print("Modified Hybrid Guard file:{}".format(hybrid_guard_js))


