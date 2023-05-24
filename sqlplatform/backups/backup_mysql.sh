#!/bin/bash
# Create a SQL database backup
# mysqldump --opt -u [uname] -p[pass] [dbname] > [backupfile.sql]

# Select database
db_name='extension'

# Select backup location
backup_dir="/media/data/backups"

# Create file name and set path
date_stamp=$(date +"%Y%m%d")
fp_backup="$backup_dir/extension_$date_stamp.sql.gz"

# Dump 
echo "creating backup: $fp_backup"
sudo mysqldump --single-transaction=TRUE -uroot $db_name > $fp_backup

# Zip
echo "creating backup: $fp_backup"
gzip -4 $fp_backup

# Keep only the last 3 backups
cd $backup_dir
ls -tp | grep -v '/$' | tail -n +4 | xargs -d '\n' -r rm --