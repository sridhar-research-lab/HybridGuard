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
    parser.add_argument('--input_html', '-i', dest='input_html',
                        nargs=1, metavar='HTML FILE', required=True,
                        help='Input HTML file to parse')
    parser.add_argument('--hybrid_guard', '-hg', dest='hybrid_guard_file',
                        nargs=1, metavar='HTML FILE', required=True,
                        help='Input common Hybrid Guard file to add script tags and copy that file to JS folder.')
    args = parser.parse_args()
    return args


def open_read_lines(file_name):
    with open(file_name, 'r') as f:
       text = f.readlines()
    return text

if __name__ == '__main__':
    args = parse_cmd_opts()
    html_body = ''.join(open_read_lines(args.input_html[0]))
    html_soup = BeautifulSoup(html_body, 'html.parser')
    # print (html_soup.prettify())
    all_script_tags = html_soup.find_all('script')

    print("List of JS files in the html: {}".format(args.input_html[0]))
    hg_funcs = list()
    import re
    js_whitelist = ['cordova', 'jQuery', 'phonegap']
    whitelist_pattern = re.compile('(' + '|'.join(js_whitelist) + ')', re.I)
    print(whitelist_pattern)
    
    js_directory= "js/"
    if not os.path.exists(js_directory):
        os.makedirs(js_directory)
        print("No js/ folder found. creating one.")
    file_index=0
    for script in all_script_tags:
        src = script.get('src')
        if src and re.search(whitelist_pattern, src):
            continue            # Skip if the file has whitelisted contents
        elif src:
            # Move the file name to FlashJax
            hg_funcs.append(src)
            print (src)
        else:
            # Get inline JS
            # Write JS to a new file
            from datetime import datetime as d
            file_index += 1
            curr_time = d.now().strftime('%d_%m_%Y_%H_%M_%S')
            inline_file_name = 'js/inline_'+ curr_time + '_'+str(file_index)+'.js'
            print ("-------------------------------------------------------------------------------------------------------")
            print ("Found some inline JS. Making a new file {} and including it in Hybrid Guard.\nCode in inline JS is:".format(inline_file_name))
            print (''.join(script.contents))
            print ("-------------------------------------------------------------------------------------------------------")
            with open(inline_file_name, 'w') as f:
                f.write(''.join([x.encode('utf-8').strip() for x in script.contents]) + '\n')
            hg_funcs.append(inline_file_name)
        script.decompose()
    
    hybrid_guard_js = "js/HybridGuard.js"
    new_tag = html_soup.new_tag("script", src=hybrid_guard_js)
    html_soup.head.append(new_tag)

    print ("Backing up {} to {}".format(args.input_html[0], 'original_' + args.input_html[0]))
    os.rename(args.input_html[0], 'original_' + args.input_html[0])
    with open(args.input_html[0], 'w') as f:
        f.write(str(html_soup))

    print("Copying HybridGuard.js and policy_config.json to js/ : {}".format(args.hybrid_guard_file[0]))
    shutil.copyfile(args.hybrid_guard_file[0], hybrid_guard_js)
    package_json_file = re.sub('HybridGuard.js', 'policy_config.json', args.hybrid_guard_file[0])
    print("\nPackage_config.json path : {}".format(package_json_file))
    shutil.copyfile(package_json_file, "js/policy_config.json")
    print ("Modifying Hybrid Guard file:{}".format(hybrid_guard_js))
    with open(hybrid_guard_js) as f:
        hg_file_contents = f.readlines()

    last_index=hg_file_contents.index('})();\n')
    if not last_index:
        print ("Unable to find the pattern })();\\n in the HG file : {}".format(hybrid_guard_js))
        exit(-1)
    func_hg = 'loadExternalJS("local", "{}");\n'

    for js in hg_funcs:
        hg_file_contents.insert(last_index, func_hg.format(js))
        last_index = func_hg; 
    print("Backing up the original Hybrid Guard file {} to {}".format(hybrid_guard_js, hybrid_guard_js + '.bak'))
    shutil.copyfile(hybrid_guard_js, hybrid_guard_js + '.bak')
    with open(hybrid_guard_js, 'w') as f:
            f.write(''.join(hg_file_contents))
    print("Modified Hybrid Guard file:{}".format(hybrid_guard_js))


