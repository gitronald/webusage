""" Database table models to create

      Type | Maximum length
-----------+-------------------------------------
  TINYTEXT |           255 (2 8−1) bytes
      TEXT |        65,535 (216−1) bytes = 64 KiB
MEDIUMTEXT |    16,777,215 (224−1) bytes = 16 MiB
  LONGTEXT | 4,294,967,295 (232−1) bytes =  4 GiB

"""
from app import db

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    user_id = db.Column(db.String(128))
    browser = db.Column(db.String(10))
    consent = db.Column(db.Boolean)
    consent_fb = db.Column(db.Boolean)
    install_time = db.Column(db.String(128))
    version = db.Column(db.String(10))
    
    def __repr__(self):
        return '<User %r>' % self.id

class Data(db.Model):
    __tablename__ = 'data'
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    api = db.Column(db.String(128))
    data = db.Column(db.Text(4294000000))
    user_id = db.Column(db.String(128))
    worker_id = db.Column(db.String(128))
    timestamp = db.Column(db.String(128))
    version = db.Column(db.String(25))

    def __repr__(self):
        return '<Data %r>' % self.id


class BrowserHistory(db.Model):
    __tablename__ = 'browser_history'
    sql_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    hv_id = db.Column(db.String(260))
    id = db.Column(db.String(128))
    visitId = db.Column(db.String(128))
    url = db.Column(db.Text)
    visitTime = db.Column(db.BigInteger)
    referringVisitId = db.Column(db.String(128))
    transition = db.Column(db.String(25))
    user_id = db.Column(db.String(128))
    worker_id = db.Column(db.String(128))
    timestamp = db.Column(db.String(128))
    version = db.Column(db.String(25))


class WebsiteHistory(db.Model):
    __tablename__ = 'website_history'
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    url = db.Column(db.Text)
    name = db.Column(db.String(25))
    html = db.Column(db.Text(4294000000))
    user_id = db.Column(db.String(128))
    worker_id = db.Column(db.String(128))
    timestamp = db.Column(db.String(128))
    version = db.Column(db.String(25))


class Snapshots(db.Model):
    __tablename__ = 'snapshots'
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    wintab = db.Column(db.String(128))
    incognito = db.Column(db.Boolean)
    url = db.Column(db.Text)
    html = db.Column(db.Text(4294000000))
    user_id = db.Column(db.String(128))
    worker_id = db.Column(db.String(128))
    timestamp = db.Column(db.String(128))
    version = db.Column(db.String(25))


class Activity(db.Model):
    __tablename__ = 'activity'
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    wintab = db.Column(db.String(128)) 
    lastwt = db.Column(db.String(128)) 
    type = db.Column(db.String(25))
    url = db.Column(db.Text)
    html = db.Column(db.Text(4294000000))
    links = db.Column(db.Text(16777000))
    tweet_ids = db.Column(db.Text)
    youtube_iframes = db.Column(db.Text)
    user_id = db.Column(db.String(128))
    worker_id = db.Column(db.String(128))
    timestamp = db.Column(db.String(128))
    version = db.Column(db.String(25))
