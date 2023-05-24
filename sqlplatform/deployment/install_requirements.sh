
# Get Ubuntu packages
sudo apt-get install mysql-server; # MySQL
sudo apt-get install python3-pip;  # Python package manager
sudo apt-get install virtualenv;   # Python virtual environments

# Create virtualenv and requirements
cd sqlplatform;
virtualenv venv --python=python3.8
source venv/bin/activate;
pip install -r requirements.txt;