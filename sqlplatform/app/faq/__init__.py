from flask import Blueprint

bp = Blueprint('faq', __name__)

from app.faq import routes
