from flask import Blueprint

bp = Blueprint('snapshots', __name__)

from app.snapshots import routes
