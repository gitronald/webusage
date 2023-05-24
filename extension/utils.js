/**
 * Utility functions and definitions.
 * @namespace utils
 */

var DEBUG = {
    log: true,
    log_json: true,
    storage: true,
    cookies: false
}

// Logging ---------------------------------------------------------------------

/**
 * General console logging.
 * 
 * @param {Object} obj1 An object to log
 * @param {Object} obj2 A second object to log
 * 
 * @memberof logging
 * 
 */
function log_console(obj1, obj2=false) {
    if (DEBUG.log) { 
        console.log(obj1) 
        if (obj2) {
            console.log(obj2) 
        }
    }
}

/**
 * Log dictionary with title
 * 
 * @param {Object} obj1 An object to log
 * @param {Object} obj2 A second object to log
 * 
 * @memberof logging
 * 
 */
function log_print(obj1, obj2={}) {
    var output = obj1
    output += '\n' + jsonify_format(obj2);
    log_console(output)
}

// Log general errors
function log_err(message, err) {
    console.error(message + ' | ' + err + '\n' + err.stack);
}

function jsonify(dict, rep, space) { return JSON.stringify(dict, rep, space) }
function jsonify_format(dict) { return jsonify(dict, null, 2) }
function log_json(dict) { log_console(jsonify_format(dict)) }


// Log worker activity
function log_work(worker_id, msg, data) {
    var work_msg = '['+worker_id+'] ' + msg;
    if (is_defined(data)) {
        log_print(work_msg, data);
    } else {
        log_console(work_msg);
    }
}

// Log worker specific errors
function log_work_err(worker_id, msg, err) {
    var work_msg = '['+worker_id+'] ' + msg;
    log_err(work_msg, err);
}


/**
 * Assert condition
 * 
 * @param {Object} condition The boolean condition to assert.
 * @param {string} message The error message to raise.
 * 
 * @memberof logging
 */
function assert(condition, message) {
    if (!condition) {
        message = message || 'Assertion failed';
        if (typeof Error !== 'undefined') {
            throw new Error(message);
        }
        throw message; // Fallback
    }
}


// Booleans --------------------------------------------------------------------

function is_defined(obj) { return typeof obj != 'undefined'}
function is_undefined(obj) { return typeof obj === 'undefined'}
function is_function(obj) { return obj && typeof(obj) === 'function' }
function is_false(obj) { return obj === false }
function is_array(obj) { return obj.prop && obj.prop.constructor === Array }

/**
 * Check if any dicts in an array are false.
 * 
 * @param {Array} records An array of dictionaries
 * @param {Array} keys The subset of keys to check
 * @param {vkey} vkey The second level key to check
 * 
 * @memberof utils
 */
function any_false(records, keys, vkey) {
    return keys.some(function(key) { return is_false(records[key][vkey]) });
}

// Time ------------------------------------------------------------------------

function isostamp() { return new Date().toISOString() }
function timestamp(unit='ms') { 
    stamp = new Date().getTime() 
    stamp = (unit === 's') ? stamp / 1000 : stamp;
    stamp = (unit === 'us') ? stamp * 1000 : stamp;
    return stamp
}
function days_to_secs(n_days) { return n_days * 24 * 60 * 60 };
function days_to_millisecs(n_days) { return days_to_secs(n_days) * 1000 };
function days_to_microsecs(n_days) { return days_to_millisecs(n_days) * 1000 };
function iso_to_secs(isodate) { return new Date(isodate).getTime()}

/**
 * Compare if two dates are on the same day.
 * 
 * @param {Date} d1 
 * @param {Date} d2 
 * 
 * @memberof utils
 */
function is_match_date(d1, d2) {
    return d1.getFullYear() == d2.getFullYear()
        && d1.getMonth() == d2.getMonth()
        && d1.getDate() == d2.getDate();
}

// Matching and Filtering ------------------------------------------------------

// Filter a list of dicts based on a list of strings matching to a keys values
function filter_strings(items, key, strings) {
    
    var filtered_items = items.filter(function(item) {
        if (has_match(item[key], strings)) {
            return item
        }
    });
    
    return filtered_items
}

// Filter a list of dicts based on a list of integers matching to a keys values
function filter_integers(items, key, integers) {
    var filtered_items = items.filter(function(item) {
        if (has_int_match(item[key], integers)) {
            return item
        }
    });

    return filtered_items
}

/**
 * Check if item partially matches any item in a list
 * 
 * @param {string} item The string to compare
 * @param {Array} match_item the string to check for a match with 
 * 
 * @memberof utils
 */ 
function is_match(item, match_item) {
    if (is_defined(item)) {
        return item.indexOf(match_item) > -1 ? true : false
    } else {
        return undefined
    }
}

/**
 * Check for matches, return true if no comparison list 
 * 
 * @param {string} item a string to compare
 * @param {Array} match_items an array to check for matches against
 * 
 * @memberof utils
 */

function has_match(item, match_items) {
    if (match_items.length > 0) {
        return match_items.some(function(d) {return is_match(item, d)})
    } else {
        return true
    }
}

/**
 * Check for integer matches.
 * 
 * @param {number} item an integer to compare
 * @param {Array} match_items an array of integers to compare against
 * 
 * @memberof utils
 */
function has_int_match(item, match_items) {
    return match_items.some(function(i) { return i === item })   
}

// Misc ------------------------------------------------------------------------


// Python-like dictionary pop
Object.defineProperty(Object.prototype, 'pop', {
   enumerable: false,
   configurable: true,
   writable: false,
   value: function (key) {
        const ret = this[key];
        delete this[key];
        return ret;
    }
});

/**
 * Convert a key value pair to a dictionary.
 * 
 * @param {String} k The key to use
 * @param {Object} v The object to use
 * 
 * @memberof utils
 */
function make_dict(k, v) {
    var d = {}
    d[k] = is_undefined(v) ? '' : v
    return d
}

/**
 * Combine two dictionaries
 * 
 * @param {Object} dict1 A dictionary to combine
 * @param {Object} dict2 Another dictionary to combine dict1 with
 * 
 * @memberof utils
 */
function combine_dicts(dict1, dict2){
    var out_dict = {};
    for (var i in dict1) {
        out_dict[i] = dict1[i];
    }
    for (var j in dict2) {
      out_dict[j] = dict2[j];
    }
    return out_dict;
}


/**
 * Create a random ID.
 * 
 * @param {number} length The length of the random ID
 * 
 * @memberof utils
 */
function make_id(length) {
    var id = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    characters += '0123456789'
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        id += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return id;
 }

/**
 * Extract subset dicts from a list of dicts.
 * 
 * @param {Array} dict_list A list of dicts
 * @param {string} key_list A list of dict keys
 * 
 * @memberof utils
 */
function extract_by_keys(dict_list, key_list) { 
    
    var subset_list = []; 
    dict_list.forEach(function(dict) { 
        
        // Subset dictionary by key list
        var subset_dict = {}
        key_list.forEach(function(key) { 
            subset_dict[key] = dict[key]
        });

        subset_list.push(subset_dict) 
    });
    return subset_list
}

/**
 * Clone a nested object.
 * 
 * @param {Object} oldObject 
 * 
 * @memberof utils
 */
const clone_object = (oldObject) => {
    let newObject = oldObject;
    if (oldObject && typeof oldObject === 'object') {
        
        // Handle arrays
        if (Array.isArray(oldObject)) {
            newObject = [];
        
        // Handle dates
        } else if (
            Object.prototype.toString.call(oldObject) === '[object Date]' &&
            !isNaN(oldObject)
        ) {
            newObject = new Date(oldObject.getTime());
        
        // Handle nested objects with recursion
        } else {
            newObject = {};
            for (let i in oldObject) {
                newObject[i] = clone_object(oldObject[i]);
            }
        }
    }
    return newObject;
}

// State Storage ---------------------------------------------------------------

// Common root object for storage functions
var storage = {

    /**
     * Place data in storage with dict - e.g. ('myKey', value)
     * 
     * @param {String} key The storage.local key to set
     * @param {Object} value The value to set with the provided key
     * @param {Boolean} log Log the set data or not 
     * 
     * @memberof storage
     */
    set: function (key, value, log=true) {
        record = make_dict(key, value)
        return browser.storage.local.set(record)
        .then(function () {
            if (
                DEBUG.storage &&
                log === true
            ) {
                log_print('['+key+'] storage set:', value);
            }
        });
    },

    /**
     * Retrieve data from storage with key - e.g. 'myKey'
     * 
     * @param {String} key The storage.local key to retrieve
     * 
     * @memberof storage
     */
    get: function(key, log) {
        return browser.storage.local.get(key)
        .then(function(items) {
            var value = items[key];
            if (log) log_print('['+key+'] storage get:', value);
            return value;
        });
    }
};


// Fetch -----------------------------------------------------------------------

/**
 * POST a json message to a URL and receive response json promise
 * 
 * @param {String} url A URL to send a request to
 * @param {String} body A jsonable object containing the request details
 * 
 * @memberof utils
 */
function fetch_post_json(url, body){

    let details = { 
        method: 'POST', 
        headers: {
            'Accept': 'application/json', 
            'Content-Type': 'application/json' 
        },
        body: jsonify(body)
    }
    
    var data = fetch(url, details)
        .then(response_validation)
        .then(response_to_json)
        .then(function(data) { return data })
        .catch(function(error) {
            log_err('Request failed', error)
        });

    return data
}

/**
 * GET text content at a given URL
 * 
 * @param {String} url A URL to send a request to
 * @param {String} body A jsonable object containing the request details
 * 
 * @memberof utils
 */
function fetch_get(url){
    let details = { 
        method: 'GET'
    }

    var data = fetch(url, details)
    .then(response_validation)
    .then(response_to_text)
    .catch(function(error) {
        console.error('Request failed', error)
    });

    return data
}

/**
 * Handle network error/success
 * 
 * @param {Object} response A server fetch response object
 * 
 * @memberof utils
 */
function response_validation(response) {
    if (!response.ok) throw Error(response.text());
    return response;
}

/**
 * Convert response to json.
 * 
 * @param {Object} response A server fetch response object
 * 
 * @memberof utils
 */
function response_to_json(response) {
    return response.json()
}

/**
 * Convert response to text.
 * 
 * @param {Object} response A server response object
 * 
 * @memberof utils
 */
function response_to_text(response) {
    return response.text()
}

// Worker Messaging ------------------------------------------------------------

/**
 * @typedef {Object} Message
 * @property {string} to The recipient of the message.
 * @property {string} from The sender of the message.
 * @property {string} subject The subject of the message.
 * @property {string} [state] The current worker state (added on send).
 * @property {Object} [permissions] Requested permissions (subject=permissions).
 * @property {Object} [api_params] Requested API parameters (subject='api').
 * 
 * @memberof workers
 */

/**
 * Message background script.
 * 
 * @param {Message} msg Message from worker
 * 
 * @memberof workers
 */
function message_background(msg) { postMessage(msg) };

/**
 * Check message for errors.
 * 
 * @param {Message} msg Message from worker
 * 
 * @memberof utils
 */
function check_message(msg, worker_id){
    assert(msg.to === worker_id, 'Message sent to wrong worker')
    log_json(msg)
}


// HTML Sanitizing -------------------------------------------------------------

/**
 * Sanitizing HTML
 * 
 * @param {string} html The HTML to be sanitized
 * @param {string} url The URL of the HTML
 * 
 * @memberof utils
 */
function sanitize_html(html, url){
    log_console('Sanitizing HTML | ' + url);
    
    var url = url.toLowerCase();
    
    if (is_match(url, 'google.com')) {  // Google products.
        
        /* Google account info can found using the class identifier "gb_D gb_Oa gb_i".
         * We aim to remove "<...gb_D gb_Oa gb_i...>" from the HTML string.
         * "<[^<]*" matches only one "<" before the identifier to avoid "<...><...gb_D gb_Oa gb_i...>".
         * "[^>]*>" matches only one ">" after the identifier to avoid "<...gb_D gb_Oa gb_i...><...>".
         */
        html = html.replace(/<[^<]*(gb_D gb_Oa gb_i)[^>]*>/g, '')

    } else if (is_match(url, 'youtube.com')) {  // YouTube products.
        
        /* YouTube account info can found using id="email" and id="account-name".
         * Regex rule is similar to that of Google.
         */
        html = html.replace(/<[^<]*(id=\"email\")[^>]*>/g, '')
        html = html.replace(/<[^<]*(id=\"account-name\")[^>]*>/g, '')

        // TODO: Name also appears in comment box:
        // <span dir="auto" class="style-scope yt-formatted-string">Commenting publicly as </span><span dir="auto" class="bold style-scope yt-formatted-string">Ronald Robertson</span>


    } else if (is_match(url, 'twitter.com')) {  // Twitter products.
        
        /* Twitter account info can found using a list of css classes.
         * Regex rule is similar to that of Google.
         */
        html = html.replace(/<[^<]*(css-4rbku5 css-18t94o4 css-1dbjc4n r-1habvwh r-1loqt21 r-6koalj r-eqz5dr r-16y2uox r-1ny4l3l r-oyd9sg r-13qz1uu)[^>]*>/g, '')
    }
    
    // Sanitizer for other URLs are not implemented.
    return html
}
