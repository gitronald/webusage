# Start the Flask server for receiving data
export FLASK_DIR="sqlplatform"
export FLASK_APP="app.py"
export FLASK_ENV="venv/bin/python"

LOCAL_SQL=false

function kill_flask() {
    # Kill existing Flask processes
    flask_pid=$(pgrep flask)
    if [[ $flask_pid ]]; then
        echo "Killing Flask on ${flask_pid}"
        kill $flask_pid;
    fi
}

# Kill existing flask process
kill_flask

# Enter directory
cd $FLASK_DIR  

# Create database
python db_create.py

# Start Flask
echo "Starting Flask: "$FLASK_ENV
sudo $FLASK_ENV $FLASK_APP
# python $FLASK_APP
