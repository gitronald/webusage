# Deployment Walkthrough


------------------------------------------------------------------------------

1. Change sudo password: 
```sh
sudo passwd $USER;
```

------------------------------------------------------------------------------

2. Update packages:

```sh
sudo apt-get update;
sudo apt-get upgrade;
```

------------------------------------------------------------------------------

3. Sync files to remote server:

```sh

# Set ssh details
declare -A webusage_details=( 
    [user]=rer
    [server]=achtung-webusage.ccs.neu.edu
    [key]=id_rsa_neu
);

# Set variables for rsync destination
WebUsageUser="${webusage_details[user]}@${webusage_details[server]}";
WebUsage="$WebUsageUser:/home/${webusage_details[user]}";

# Send directory
rsync -azvP sqlplatform $WebUsage;
```

------------------------------------------------------------------------------

4. Install requirements

```sh

# Get Ubuntu packages
sudo apt-get install mysql-server; # MySQL
sudo apt-get install python3-pip;  # Python package manager
sudo apt-get install virtualenv;   # Python virtual environments

# Create virtualenv and requirements
cd sqlplatform;
virtualenv venv --python=python3.8
source venv/bin/activate;
pip install -r requirements.txt;
```

------------------------------------------------------------------------------

5. Create MySQL Database (updated with pw plugin: `caching_sha2_password`)
```sh 

# Create database
sudo mysql < deployment/init_db.sql;

# Create user
sudo mysql < deployment/init_user.sql;

# Activate virtualenv and create database tables
source venv/bin/activate;
python db_create.py;
```


------------------------------------------------------------------------------

6. Update HTTPS Certification
```sh

# Install packages
sudo apt-get install software-properties-common;
sudo add-apt-repository universe;
sudo apt-get update;
sudo apt-get install certbot -y;

# Create certifications (interactive input)
sudo certbot certonly --standalone;

# New necessary files will be in:
# /etc/letsencrypt/live/webusage.xyz/privkey.pem;
# /etc/letsencrypt/live/webusage.xyz/fullchain.pem;

```

------------------------------------------------------------------------------

7. Set up nginx
```sh 
bash nginx_setup.sh;
```

------------------------------------------------------------------------------

8. Set up supervisor
```sh 
bash supervisor_setup.sh;
```

------------------------------------------------------------------------------


9. Automate MySQL backups
```sh 
# Login to sudo and then install crontab
sudo -i
crontab ../backups/crontab.cnf
```

