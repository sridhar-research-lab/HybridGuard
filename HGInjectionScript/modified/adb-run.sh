#!bin/bash
pkg=$(aapt dump badging $1 | head -1 | gawk -F " " '{print $2}'| gawk -F "=" '{print $2}' | xargs)
act=$(aapt dump badging $1 |gawk -F" " '/launchable-activity/ {print $2}'|gawk -F "=" '{print $2}' | xargs)
echo $pkg
