#!/bin/bash

folder="app/static/firefox"
symlink="northeastern_university_web_usage_study-fx.xpi"

# Remove old symlink
rm $folder/$symlink

# Get current version
curr_version=$(ls -tr $folder | grep northeastern | tail -n1)

# Make symlink
ln -sr $folder/$curr_version $folder/$symlink
