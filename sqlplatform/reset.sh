# Reset everything

source venv/bin/activate

echo "creating database"
sudo mysql < deployment/init_db.sql
python db_create.py

echo "cleaning log file"
sudo truncate -s 0 /var/log/supervisor/sqlplatform-stdout.log
sudo truncate -s 0 /var/log/supervisor/sqlplatform-stderr.log

echo "restarting supervisor"
sudo supervisorctl restart sqlplatform