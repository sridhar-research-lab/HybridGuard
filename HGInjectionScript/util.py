import os

def getAllDirectories(path):
    directories = os.listdir(path)
    return directories

def getOnlyDirectories(path):
    dirs = []
    directories = os.listdir(path)
    for dir in directories:
        if dir.is_dir():
            dirs.append(dir)
    return dirs

def getFilesInsideDirectory(path):
    files = []
    directories = os.listdir(path)
    for f in directories:
        if not f.is_dir():
            files.append(f)
    return files