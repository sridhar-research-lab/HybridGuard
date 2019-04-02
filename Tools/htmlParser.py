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
                        help='Input Hybrid Guard file to add script tags')
    args = parser.parse_args()
    return args


def open_read_lines(file_name):
    with open(file_name, 'r') as f:
       text = f.readlines()
    return text

if __name__ == '__main__':
    args = parse_cmd_opts()
    html_body = ''.join(open_read_lines(args.input_html[0]))
    html_soup = BeautifulSoup(html_body, 'lxml')
    # print (html_soup.prettify())
    all_script_tags = html_soup.find_all('script')

    print("List of JS files in the html: {}".format(args.input_html[0]))
    hg_funcs = list()
    import re
    js_whitelist = ['cordova', 'jQuery']
    whitelist_pattern = re.compile('(' + '|'.join(js_whitelist) + ')', re.I)

    for script in all_script_tags:
        src = script.get('src')
        if src and re.search(whitelist_pattern, src):
            print("Skipping {} as it is whitelisted".format(src))
            continue            # Skip if the file has whitelisted contents
        elif src:
            # Move the file name to FlashJax
            hg_funcs.append(src)
            print (src)
        else:
            # Get inline JS
            # Write JS to a new file
            from datetime import datetime as d
            curr_time = d.now().strftime('%d_%m_%Y_%H_%M_%s')
            if not os.path.isdir('./js'):
                os.makedirs('./js')
            inline_file_name = 'js/inline_'+ curr_time + '.js'
            print ("Found some inline JS. Making a new file {} and including it in Hybrid Guard.\nCode in inline JS is:".format(inline_file_name))
            print (''.join(script.contents))
            with open(inline_file_name, 'w') as f:
                f.write(''.join([x.strip() for x in script.contents]) + '\n')
            hg_funcs.append(inline_file_name)
        script.decompose()

    # Append Hybrid Guard script tag
    hg_script_tag = html_soup.new_tag('script', src="js/hybridGuard.js", type="text/javascript")
    html_soup.body.insert_before(hg_script_tag)

    print ("Backing up {} to {}".format(args.input_html[0], 'original_' + args.input_html[0]))
    os.rename(args.input_html[0], 'original_' + args.input_html[0])
    with open(args.input_html[0], 'w') as f:
        f.write(str(html_soup))

    print ("Modifying Hybrid Guard file:{}".format(args.hybrid_guard_file[0]))
    with open(args.hybrid_guard_file[0]) as f:
        hg_file_contents = f.readlines()

    last_index=hg_file_contents.index('})();\n')
    if not last_index:
        print ("Unable to find the pattern })();\\n in the HG file : {}".format(args.hybrid_guard_file))
        exit(-1)
    func_hg = "    loadExtJSFile(\"{}\");\n"
    # func_hg = '    loadExtJSFile({});\n'

    for js in hg_funcs:
        hg_file_contents.insert(last_index, func_hg.format(js))
    print("Backing up the original Hybrid Guard file {} to {}".format(args.hybrid_guard_file[0], args.hybrid_guard_file[0] + '.bak'))
    shutil.copyfile(args.hybrid_guard_file[0], args.hybrid_guard_file[0] + '.bak')
    with open(args.hybrid_guard_file[0], 'w') as f:
            f.write(''.join(hg_file_contents))
    print("Modified Hybrid Guard file:{}".format(args.hybrid_guard_file[0]))

    print ("Moving Hybrid Guard {} to js directory.".format(args.hybrid_guard_file[0]))
    shutil.move(args.hybrid_guard_file[0] , 'js/'+args.hybrid_guard_file[0])
