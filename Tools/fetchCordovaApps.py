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
                                    print(index)
                                    index_dirs.append(os.path.abspath(index))
                                else :
                                    non_index_dirs.append(dir1)

    # print(index_dirs)
    return index_dirs


fetchHtml()
