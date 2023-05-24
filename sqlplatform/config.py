"""Flask config class."""
import os
import json

def get_mysql_uri(fp_credentials, db):

    # Load credentials
    if os.path.exists(fp_credentials):
        with open(fp_credentials, 'r') as infile:
            cred = json.load(infile)
    else:
        print('Credentials file not found')
        cred = {'user':'', 'pass':''}
    
    base = "mysql+pymysql://"
    charset = "?charset=utf8mb4"

    return f"{base}{cred['user']}:{cred['pass']}@localhost:3306/{db}{charset}"

DB_TYPE = 'mysql'
FP_CREDENTIALS = './cred'

# Database URLs
MYSQL_URI = get_mysql_uri(FP_CREDENTIALS, "extension")
SQLITE3_URI = 'sqlite:///test.db'

class Config(object):
    """Base config vars."""
    WTF_CSRF_ENABLED = True
    SECRET_KEY = 'redacted_pw'
    SQLALCHEMY_DATABASE_URI = MYSQL_URI if DB_TYPE == 'mysql' else SQLITE3_URI
    SQLALCHEMY_POOL_RECYCLE = 3600
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class ProdConfig(Config):
    DEBUG = False
    TESTING = False

class DevConfig(Config):
    DEBUG = True
    TESTING = True
    EXPLAIN_TEMPLATE_LOADING = True