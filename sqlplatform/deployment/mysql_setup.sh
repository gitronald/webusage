# Setting up MySQL database
# 

sudo mysql -e "select @@datadir;" # Show current data directory
sudo /etc/init.d/mysql stop

echo "setting mysql config file"
sudo cp deployment/my.cnf /etc/mysql/my.cnf; 

echo "editing app armor alias for new data location"
sudo cp deployment/apparmor.alias.conf /etc/apparmor.d/tunables/alias
sudo /etc/init.d/apparmor restart
sudo /etc/init.d/mysql start

# Create database
echo "setting up mysql database"
sudo mysql < deployment/init_db.sql;

# Create user
echo "setting up mysql user"
sudo mysql < deployment/init_user.sql;

# Activate virtualenv and create database tables
source venv/bin/activate;
python db_create.py;
