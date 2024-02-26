#!/usr/bin/env python3
"""Utility script for building Chrome and Firefox packages."""

import sys, os, shutil, json, termcolor, tempfile

# Replace a line in a file
def replace_file_line(filepath, original, replacement):
    # Create temp file
    fh, abs_path = tempfile.mkstemp()
    with os.fdopen(fh,'w') as new_file:
        with open(filepath) as old_file:
            for line in old_file:
                line = f"{replacement}\n" if line.strip() == original else line
                new_file.write(line)

    # Copy the file permissions from the old file to the new file
    shutil.copymode(filepath, abs_path)
    # Remove original file
    os.remove(filepath)
    # Move new file
    shutil.move(abs_path, filepath)


ARCHIVE_NAME = 'extension'
ARCHIVE_EXT = 'zip'
EXTENSION_PATH = 'extension/'
TEMP_PATH = 'tmp/'
FIREFOX_PATH = 'sqlplatform/app/static/firefox/'
FIREFOX_URL_SLUG = 'https://webusage.xyz/static/firefox/'
UUID = '{5b66c614-f950-4642-9017-8c590c085395}'

# Remove old packages, if they exists
try:
    os.remove("{}-chrome.{}".format(ARCHIVE_NAME, ARCHIVE_EXT))
except:
    pass
try:
    os.remove("{}-fx.{}".format(ARCHIVE_NAME, ARCHIVE_EXT))
except:
    pass

# Zip up a new Chrome package
shutil.make_archive('{}-chrome'.format(ARCHIVE_NAME), ARCHIVE_EXT, EXTENSION_PATH)

# Load the manifest and pull out the extension name and version number
manifest_path = os.path.join(EXTENSION_PATH, 'manifest.json')
with open(manifest_path, 'r') as infile:
    manifest = json.load(infile)
name = manifest['name']
version = manifest['version']

# Read the old Firefox updates.json
ffupdate_path = os.path.join(FIREFOX_PATH, 'updates.json')
ffupdate = json.loads(open(ffupdate_path).read())

# Is this version already in updates.json?
if any(u['version'] == version for u in ffupdate['addons'][UUID]['updates']):
    print(termcolor.colored(
        'Version {} already appears in {}updates.json'.format(version, FIREFOX_PATH),
        'red'))
else:
    # Add the new version to ffupdate
    ffupdate['addons'][UUID]['updates'].append(
        {
            'version' : version,
            'update_link' : "{}{}-{}-fx.xpi".format(
                FIREFOX_URL_SLUG,
                '_'.join(name.lower().split()),
                version
            )
        }
    )

    # Write out the new updates.json file
    with open(ffupdate_path, 'w') as f:
        f.write(json.dumps(ffupdate, indent=4, sort_keys=True))

# Copy the extension to a new temp directory
shutil.copytree(EXTENSION_PATH, TEMP_PATH)

# Change hard-coded browser name in config for Firefox
replace_file_line(
    filepath=os.path.join(TEMP_PATH, 'config.js'), 
    original="var BROWSER = 'chrome';", 
    replacement="var BROWSER = 'firefox';"
)

# Change hard-coded browser name in config for Firefox
replace_file_line(
    filepath=os.path.join(TEMP_PATH, 'config.js'), 
    original="'periodic_snapshots',", 
    replacement="//'periodic_snapshots',"
)


# Add the FF settings to the manifest and rewrite it
manifest["browser_specific_settings"] = {
    "gecko": {
        "id": UUID,
        "update_url": FIREFOX_URL_SLUG + "updates.json"
    }
}

# Add host permissions to handle FF CORS error
manifest["permissions"].extend([
    "https://webusage.xyz/*",
    "https://myactivity.google.com/item?*",
    "https://adssettings.google.com/*",
    "https://*.nielsen.com/*",
    "https://o.bluekai.com/*"
    
])

with open(os.path.join(TEMP_PATH, 'manifest.json'), 'w') as f:
    f.write(json.dumps(manifest, indent=4, sort_keys=True))

# Zip up a new Firefox package
shutil.make_archive('{}-fx'.format(ARCHIVE_NAME), ARCHIVE_EXT, TEMP_PATH)

# Remove the temp directory
shutil.rmtree(TEMP_PATH, ignore_errors=True)
