"""Save Extension Data
"""
from flask import request, json, jsonify, current_app

from app import db
from app.models import User, Data, BrowserHistory, WebsiteHistory, Snapshots, Activity
from app.save_data import bp

import base64
import traceback
from pprint import pprint


def get_source_from_id(_id):
    """Extract source from User ID"""
    id_hyphens = _id.split('-')

    if _id.startswith('test-'):
        return 'test'
    elif len(id_hyphens) == 5:
        return 'qualtrics'
    elif len(_id) == 14:
        return 'yougov'

def check_if_id_exists(model, id):
    row = db.session.query(model[id])
    value = value.filter_by(user_id=user_id).scalar() 
    return value is not None

def check_if_user_exists(user_id):
    row = db.session.query(User.user_id)
    value = value.filter_by(user_id=user_id).scalar() 
    return value is not None

def b64encode_json(data):
    """Convert dict to json string and base64 encode it"""
    utf8_json_str = json.dumps(data).encode('utf-8')
    return base64.urlsafe_b64encode(utf8_json_str).decode('ascii')

def save_to_sql(data):
    """Save data to SQL database"""
    try:
        db.session.add(data)
        db.session.commit()        
        db.session.close()
    except:
        err = f'Error saving: {traceback.format_exc()}'
        current_app.logger.error(err)
        return jsonify(dict(error=err))

# Receive data from the browser extension and save to json lines file.
@bp.route('/save_user', methods=['POST'])
def save_user():
    try:
        # Store new user
        print('Saving new user')
        new_user = request.get_json(force=True)
        save_to_sql(data=User(**new_user))
        
        pprint(new_user)
        return jsonify(dict(success="Saved user."))

    except:
        err = f'Error saving user: {traceback.format_exc()}'
        current_app.logger.error(err)
        return jsonify(dict(error=err))

# Receive data from the browser extension and save to json lines file.
@bp.route('/save_data', methods=['POST'])
def save_data():
    # if request.method == 'POST':
    try:
        # Receive data
        data = request.get_json(force=True)

        # Check user source
        user_source = get_source_from_id(data['user_id'])
        if user_source == 'yougov':
            # Reject data from yougov participants
            return jsonify(dict(error=f"data not saved, participation for your group has ended, please uninstall the extension"))

        # Check if matches an existing SQL model
        model_key = data['api']
        
        if model_key == 'browser_history':
            return handle_browser_history(data)

        elif model_key == 'website_history':
            return handle_website_history(data)

        elif model_key == 'periodic_snapshots':
            return handle_snapshots(data)
        
        elif model_key == 'activity':
            return handle_activity(data)

        else:
            # No matching SQL model
            if 'data' in data:
                data['data'] = b64encode_json(data['data'])  
            else:
                data['data'] = 'error: no data received'
            save_to_sql(data=Data(**data))
            return jsonify(dict(success=f"[{data['api']}] saved as generic"))
            
    except:
        err = f'Error saving data\n: {traceback.format_exc()}'
        current_app.logger.error(err)
        return jsonify(dict(error=err))

def handle_activity(raw_data):
    """Store Activity data
    
    Arguments:
        raw_data {dict} -- The incoming raw data
    """
    # pprint(raw_data)
    
    api = raw_data.pop('api')
    data = raw_data.pop('data')

    # Update dict with meta data [user, browser, version]
    data.update(raw_data)

    # Save website history
    save_to_sql(Activity(**data))

    # Return response when done
    return jsonify(dict(success=f"[{api}] saved"))

def handle_browser_history(raw_data):
    """Store BrowserHistory data
    
    Arguments:
        raw_data {dict} -- The incoming raw data
    """
    # pprint(raw_data)
    
    # Extract incoming data
    api = raw_data.pop('api')
    history_items = raw_data.pop('data')

    # Get existing history-visit ids for user
    user_id = raw_data['user_id']
    query = db.session\
            .query(BrowserHistory.hv_id)\
            .filter(BrowserHistory.user_id == user_id)

    existing_ids = set([row.hv_id for row in query.distinct()])
    print(f'Existing IDs: {len(existing_ids)}')

    for history in history_items:
        print(f"Saving: {len(history['visits'])} history visit items")

        for visit in history['visits']:

            # Add history + visit ID
            visit['hv_id'] = '-'.join([visit['id'], visit['visitId']])

            # Ignore duplicates due to incomplete pull
            if visit['hv_id'] not in existing_ids:
                # Add URL to each visit
                visit['url'] = history['url']

                # Reduce time down to millisecond precision
                visit['visitTime'] = int(str(visit['visitTime']).split('.')[0])

                # Add meta data
                visit.update(raw_data)

                # Save visit to SQL database
                save_to_sql(BrowserHistory(**visit))

    # Return response when done
    return jsonify(dict(success=f"[{api}] received visits"))

def handle_website_history(raw_data):
    """Store WebsiteHistory data
    
    Arguments:
        raw_data {dict} -- The incoming raw data
    """
    # pprint(raw_data)
    
    api = raw_data.pop('api')
    data = raw_data.pop('data')

    # Update dict with meta data [user, browser, version]
    data.update(raw_data)

    # Save website history
    save_to_sql(WebsiteHistory(**data))

    # Return response when done
    return jsonify(dict(success=f"[{api}] saved"))

def handle_snapshots(raw_data):
    """Store Snapshot data
    
    Arguments:
        raw_data {dict} -- The incoming raw data
    """
    # pprint(raw_data)
    
    api = raw_data.pop('api')
    data = raw_data.pop('data')

    # Update dict with meta data [user, browser, version]
    data.update(raw_data)

    # Save website history
    save_to_sql(Snapshots(**data))

    # Return response when done
    return jsonify(dict(success=f"[{api}] saved data."))


def handle_activity(raw_data):
    """Store Activity data
    
    Arguments:
        raw_data {dict} -- The incoming raw data
    """
    # pprint(raw_data)
    
    api = raw_data.pop('api')
    data = raw_data.pop('data')

    # Update dict with meta data [user, browser, version]
    data.update(raw_data)

    for json_key in ['links', 'tweet_ids', 'youtube_iframes']:
        if json_key in data:
            data[json_key] = json.dumps(data[json_key])

    # Check if html is a list of updates (e.g. infinity scroll mutation updates)
    if 'html' in data:
        if isinstance(data['html'], list):
            data['html'] = json.dumps(data['html'])

    # Save website history
    save_to_sql(Activity(**data))

    # Return response when done
    return jsonify(dict(success=f"[{api}] saved data"))


