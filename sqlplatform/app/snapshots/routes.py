""" Snapshot API Routes
"""

from flask import request, jsonify, render_template
from app.snapshots import bp
from urllib.parse import quote_plus
import itertools

@bp.route('/taking_snapshots', methods=['GET'])
def taking_snapshots():
    return render_template('taking_snapshots.html', title='Taking Snapshots')

@bp.route('/update_search_terms', methods=['POST'])
def search_terms():
    data = request.get_json(force=True)
    if data['request_key'] == 'send_me_the_terms':

        snapshot_urls = []

        front_page_urls = [
            "https://news.google.com",
            "https://youtube.com", 
            "https://twitter.com",
            "https://www.bing.com/news"
        ]

        search_urls = [
            "https://www.google.com/search?q=",
            "https://news.google.com/search?q=",
            "https://www.youtube.com/results?search_query=",
            "https://twitter.com/search?q="
        ]

        queries = [
            'donald trump',
            'mike pence',
            'joe biden',
            'kamala harris',
            'coronavirus',
            'covid-19'
        ]

        # Add frontpage URLs to list
        snapshot_urls.extend(front_page_urls)

        # Add all search URL + query combinations to list
        pairs = itertools.product(search_urls, queries)
        snapshot_urls.extend([f"{url}{quote_plus(qry)}" for url, qry in pairs])

        return jsonify(snapshot_urls)
