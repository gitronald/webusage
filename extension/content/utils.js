/**
 * @file Content Script - Configuration and Utils.
 */


DEBUG = {
    mutations : false
}

// Global variables
var TAB_DATA = {}
var HTML_OBSERVER = new MutationObserver(m => log_console(m));
var HTML_UPDATE_INTERVAL_ID = -1;
var HTML_UPDATE_INTERVAL_TIME = 1000 * 30; // 30 seconds between html update
var HTML_UPDATE_SIZE_THRESHOLD = 50;
var HTML_UPDATES = [];

// Time in milliseconds after which any HTML update data is sent
UPDATE_SAVE_TIME_THRESHOLD = 1000 * 60 * 15

function isostamp() { return new Date().toISOString() }

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
    output += "\n" + jsonify_format(obj2);
    log_console(output)
}

function jsonify(dict, rep, space) { return JSON.stringify(dict, rep, space) }
function jsonify_format(dict) { return jsonify(dict, null, 2) }
function log_json(dict) { log_console(jsonify_format(dict)) }

/**
 * Filter an array of links with string matching.
 * 
 * @param {Array} links An array of hyperlinks
 * @param {String} match A string to filter for matches with
 * 
 * @memberof dom_parsers
 */
function filter_links(links, match) {
    return links.filter(function(link) { return is_match(link, match) });
}

/**
 * Extract values from a list of dicts.
 * 
 * @param {Array} dicts A list of dicts
 * @param {string} key The key to use on each dict
 * 
 * @memberof dom_parsers
 */
function extract_by_key(dicts, key) { 
    var values = []; dicts.forEach( function(d){ values.push(d[key]) });
    return values
}

function is_defined(obj) { return typeof obj != 'undefined' }

/**
 * Check if strings match.
 * 
 * @param {string} item a string
 * @param {Array} match_item a string to check for a match with
 * 
 * @memberof dom_parsers
 */
function is_match(item, match_item) {
    if (is_defined(item)) {
        return item.indexOf(match_item) > -1 ? true : false
    } else {
        return undefined
    }
}


/**
 * Check for matches, return true if no comparison list.
 * 
 * @param {string} item a string
 * @param {Array} match_items an array of strings to check for matches against
 * 
 * @memberof dom_parsers
 */
function has_match(item, match_items) {
    if (match_items.length > 0) {
        return match_items.some(function(d) {return is_match(item, d)})
    } else {
        return true
    }
}

// Filter a list of dicts based on a list of strings matching to a keys values
function filter_strings(items, key, strings) {
    
    var filtered_items = items.filter(function(item) {
        if (has_match(item[key], strings)) {
            return item
        }
    });
    
    return filtered_items
}


/**
 * Extract all iframes or a subset based on src
 * 
 * @param {Object} doc the document object
 * @param {Array} src_filters A list of strings to check for src matches against
 * 
 * @memberof dom_parsers
 */
function get_iframes(doc, src_filters) {
    
    // Extract all iframes
    var iframes = doc.getElementsByTagName('iframe');
    iframes = Array.from(iframes);

    // Filter based on source
    if (src_filters) {
        iframes = filter_strings(iframes, 'src', src_filters)
    }

    return iframes
}