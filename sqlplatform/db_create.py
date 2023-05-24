""" Create the SQL Database
"""
import os
import shutil
from sqlplatform import app, db

basedir = os.path.abspath(os.path.dirname(__file__))
print(basedir)

with app.app_context():
    db.init_app(app)
    db.create_all()

if app.config['SQLALCHEMY_DATABASE_URI'].startswith('sqlite:'):
    shutil.move('app/test.db', 'test.db')

print("DB created.")
