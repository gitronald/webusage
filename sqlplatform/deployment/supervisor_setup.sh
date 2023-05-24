# Setting up supervisor

# Install supervisor
echo -e "installing supervisor"
sudo apt-get install supervisor

# Configure
PROJ="/home/$USER/sqlplatform"; # flask app
fp_supervisor_config="$PROJ/deployment/supervisor.conf"

# Copy config file to supervisor config directory
echo -e "creating supervisor config files"
echo $fp_supervisor_config

sudo cp $fp_supervisor_config /etc/supervisor/conf.d

echo -e "restarting supervisor"
sudo service supervisor restart
