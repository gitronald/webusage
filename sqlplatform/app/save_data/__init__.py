from flask import Blueprint

bp = Blueprint('save_data', __name__)

from app.save_data import routes
