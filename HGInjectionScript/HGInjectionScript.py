import os
import shutil
import argparse

from parserutil import fetchHtml, getPolicies
import util

try:
    from BeautifulSoup import BeautifulSoup
except ImportError:
    from bs4 import BeautifulSoup

#Change this path
APP_PATH = "D:\\RA\\Tools\\scripts\\HGInjectionScript\\air.com.KickstandTech.MotorcycleWeather\\"
HG_file_path = "D:\\RA\\Tools\\scripts\\HGInjectionScript\\inputs\\HybridGuard.js"

def open_read_lines(file_name):
    with open(file_name, 'r', encoding="utf8") as f:
       text = f.readlines()
    return text

if __name__ == '__main__':
    dirs = fetchHtml(APP_PATH)
    for input_html in dirs :
        html_body = ''.join(open_read_lines(input_html))
        html_soup = BeautifulSoup(html_body, 'html.parser')
        all_script_tags = html_soup.find_all('script')

        # print("List of JS files in the html: {}".format(input_html))
        hg_funcs = list()
        import re
        js_whitelist = ['cordova', 'jQuery']
        whitelist_pattern = re.compile('(' + '|'.join(js_whitelist) + ')', re.I)
        print(whitelist_pattern)
        
        file_index=0
        input_html_splitted = input_html.split("\\")
        path_to_hybrid = ("\\").join(input_html_splitted[:-1])
        input_html_splitted[-1] = 'original_' + input_html_splitted[-1]
        input_html_splitted = ("\\").join(input_html_splitted)
        hybrid_guard_js = path_to_hybrid + "\\js\\HybridGuard.js"
        js_directory= path_to_hybrid+"\\js\\"
        

        if not os.path.exists(js_directory):
            os.makedirs(js_directory)
            print("No js/ folder. creating one.")
        for script in all_script_tags:
            src = script.get('src')
            if src and re.search(whitelist_pattern, src):
                script.decompose()
                continue            # Skip if the file has whitelisted contents
            elif src:
                # Move the file name to HybridGuard only if it is third party JS
                if "http:" in src or "https:" in src:
                    hg_funcs.append(src)
                    script.decompose()
                    print (src)
            else:
                # Get inline JS
                # Write JS to a new file
                from datetime import datetime as d
                file_index += 1
                curr_time = d.now().strftime('%d_%m_%Y_%H_%M_%S')
                inline_file_name = 'js\\inline_'+ curr_time + '_'+str(file_index)+'.js'
                print ("-------------------------------------------------------------------------------------------------------")
                print ("Found some inline JS. Making a new file {} and including it in Hybrid Guard.\nCode in inline JS is:".format(inline_file_name))
                print (''.join(script.contents))
                print ("-------------------------------------------------------------------------------------------------------")
                with open(path_to_hybrid +"\\"+ inline_file_name, 'w', encoding='utf8') as f:
                    f.write(''.join([x.strip() for x in script.contents]) + '\n')
                hg_funcs.append(inline_file_name.replace("\\","/"))
                #delete the script tag from index.html 
                script.decompose()

        new_tag = html_soup.new_tag("script", src="js/HybridGuard.js")
        html_soup.head.append(new_tag)
        print ("Backing up {} to {}".format(input_html, input_html_splitted))
        os.rename(input_html, input_html_splitted)
        with open(input_html, 'w', encoding="utf8") as f:
            f.write(str(html_soup))

        print("Copying HybridGuard.js and policy_config.json to js/ : {}".format(HG_file_path))
        shutil.copyfile(HG_file_path, hybrid_guard_js)
        package_json_file = re.sub('HybridGuard.js', 'policy_config.json', HG_file_path)
        print("\nPackage_config.json path : {}".format(package_json_file))
        shutil.copyfile(package_json_file, path_to_hybrid + "\\js\\policy_config.json")
        print ("Modifying Hybrid Guard file:{}".format(hybrid_guard_js))
        with open(hybrid_guard_js, 'r', encoding='utf8') as f:
            hg_file_contents = f.readlines()

        last_index=hg_file_contents.index('})();\n')
        if not last_index:
            print ("Unable to find the pattern })();\\n in the HG file : {}".format(hybrid_guard_js))
            exit(-1)
        func_hg = '    loadExternalJS("local", "{}");\n'

        for js in hg_funcs:
            hg_file_contents.insert(last_index, func_hg.format(js)) 
        
        #Enable Monitors
        enableMonitors_index=hg_file_contents.index('    function enableMonitors(){\n')
        monitorMethod_template = '        HG_instance.monitorMethod({}, "{}", {});\n'
        policies = getPolicies(APP_PATH)
        for policy in policies:
            hg_file_contents.insert(enableMonitors_index+1, monitorMethod_template.format(policy[0], policy[1], policy[2])) 
            
        #Writing Hybrid Guard file 
        print("Backing up the original Hybrid Guard file {} to {}".format(hybrid_guard_js, hybrid_guard_js + '.bak'))
        shutil.copyfile(hybrid_guard_js, hybrid_guard_js + '.bak')
        with open(hybrid_guard_js, 'w', encoding='utf8') as f:
                f.write(''.join(hg_file_contents))
        print("Modified Hybrid Guard file:{}".format(hybrid_guard_js))
