from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.ProdConfig')
    
    db.init_app(app)

    from app.faq import bp as faq_bp
    app.register_blueprint(faq_bp)

    from app.snapshots import bp as snapshots_bp
    app.register_blueprint(snapshots_bp)

    from app.save_data import bp as save_data_bp
    app.register_blueprint(save_data_bp)


    return app
