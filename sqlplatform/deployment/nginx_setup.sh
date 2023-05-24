# Setting up nginx

# Install nginx
echo -e "installing nginx"
sudo apt-get install nginx

# Configure
dir_name="sqlplatform"    # flask app
fp_nginx_config="nginx.conf"  # nginx default configuration
fp_nginx_app="nginx.sqlplatform.conf"  # nginx server configuration (IP, logs)

# Create nginx file paths
fp_available="/etc/nginx/sites-available/$dir_name"
fp_enabled="/etc/nginx/sites-enabled/$dir_name"

echo -e "overwriting default config with [$fp_nginx_config]"
sudo cp $fp_nginx_config /etc/nginx

echo -e "creating sites available and enabled with [$fp_nginx_app]"
echo $fp_available
echo $fp_enabled
sudo cp $fp_nginx_app $fp_available
sudo ln -s -f $fp_available $fp_enabled

echo -e "checking nginx configuration"
sudo nginx -t

echo -e "restarting nginx"
sudo service nginx restart
