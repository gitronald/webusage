''' MySQL Flask application for extension.
'''

from flask import Flask, render_template
from app import create_app, db
import logging

# Initialize app
app = create_app()

@app.route('/', methods=['GET'])
@app.route('/index', methods=['GET'])
def index():
    # make_connection()
    return render_template('index.html', title='Home')

@app.route('/privacy', methods=['GET'])
@app.route('/privacy/', methods=['GET'])
def privacy():
    # make_connection()
    return render_template('privacy.html', title='Privacy Policy')

if __name__ == '__main__':
    app.run()


## For logging purposes 
if __name__ != '__main__':
    gunicorn_logger = logging.getLogger('gunicorn.error')
    app.logger.handlers = gunicorn_logger.handlers
    app.logger.setLevel(gunicorn_logger.level)

