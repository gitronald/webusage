/**
 * @file API: Activity
 */

/**
 * Functions for documenting browser tab activity.
 * @namespace activity
 */

/**
 * Activity API Parameters.
 * 
 * @typedef {Object} Monitor
 * 
 * @property {Array} domains The domains to snapshot.
 * @property {boolean} process Send data to worker before saving.
 * 
 * @memberof activity
 */

// Globals ---------------------------------------------------------------------

// Current window and tab
var ACTIVE = {
    win_id: undefined,
    tab_id: undefined,
    id: undefined,
}

// Last updated tab details
var LAST_UPDATE_URL = '';
var LAST_UPDATE_TIME = 0;
var LOADING_INJECTION_SUCCESSFUL = false;

// Ignore duplicate URL updates within last sec
var THRESHOLD_RECENT = 1000 * 1; 

// Main ------------------------------------------------------------------------

/**
 * Turn on a listener that records meta data on all standard window tabs and takes a snapshot of the DOM for URLs specified in the API params.
 * 
 * @param {Message} msg The message received from a worker.
 * @param {Monitor} msg.params Activity API parameters
 * 
 * @memberof activity
 */
function api_activity(msg) {
    log_console('Activity API');

    var worker_id = msg.from
    var params = msg.api_params
    
    assert(params.api === 'activity', 'Message sent to wrong API')
    log_json(params)

    // Listen for tab activations
    browser.tabs.onActivated.addListener(function(activeInfo) {
        tab_activated_listener(activeInfo, worker_id);
    })

    // Listen for tab updates
    browser.tabs.onUpdated.addListener(function(tabId, info, tab) {
        tab_updated_listener(tabId, info, tab, params, worker_id);
    });

    // Listen for tab mutations
    browser.runtime.onMessage.addListener(function(msg, sender) {
        tab_mutation_listener(msg, sender, worker_id);
    })

}

// On Activated ----------------------------------------------------------------


// Listen for active tab change
function tab_activated_listener(activeInfo, worker_id) {

    var api = 'activity';
    
    // Get activated tab details
    var tab_id = activeInfo.tabId;
    var win_id = activeInfo.windowId;
    var wintab = [win_id,tab_id].join('-');

    // Ignore if snapshot generated tab
    if (!has_int_match(tab_id, GENERATED_TABS)) {

        log_work(worker_id, 'tab activated', )
        
        // Initialize activated record
        var data = {
            wintab: wintab,
            lastwt: is_defined(ACTIVE.id) ? ACTIVE.id : '',        
            type: 'activated',
            timestamp: timestamp()
        }

        // Overwrite active globals
        ACTIVE.win_id = win_id;
        ACTIVE.tab_id = tab_id;
        ACTIVE.id = wintab;

        // Get active tab
        browser.tabs.get(tab_id)
        .then(filter_incognito_tabs)
        .then(send_activated_message)
        .then(function(response) {
            // Record URL if tab has one
            data.url = is_defined(response) ? response.tab_info.url : '';
            // Save data
            log_work(worker_id, 'logging activated', data);
            return save_data(worker_id, data, api);
        })
        .then(function(response) {
            // Log server response
            log_work(worker_id, 'server response', response);
        })
        .catch(function(err) {
            // Handle errors
            if (err instanceof IncongitoError) {
                // Ignoring incognito tab, no stack trace
                log_work(worker_id, err.message);
            } else {
                // Unknown errors, full stack trace
                log_work_err(worker_id, 'error', err);
            }
        })
    }
}


// Send message when tab is loading (onActivated) to save and reset variables.
function send_activated_message(tab) {
    
    // Set loading message
    var activity_msg = {
        to: 'content',
        from: 'activity', 
        subject: 'tab_activated'
    };

    // Send to content script in specified tab
    return send_tab_message(tab, activity_msg);        
}


// On Updated ------------------------------------------------------------------

/**
 * Catch onUpdated tab details and send content messages.
 * 
 * @param {Message} msg The message received from a worker.
 * @param {Monitor} msg.params Activity API parameters
 * 
 * @memberof activity
 */
function tab_updated_listener(tabId, info, tab, params, worker_id) {

    // Get updated tab details
    var tab_id = tab.id;
    var win_id = tab.windowId;
    var wintab = [win_id,tab_id].join('-');

    // If tab is not a incognito or generated tab
    if (
        !tab.incognito &&
        !has_int_match(tab_id, GENERATED_TABS)
    ) {

        log_work(worker_id, 'tab updated | '+tab.id);

        // If tab is loading
        if (info.status === 'loading') {
            log_work(worker_id, 'tab loading | '+tab.id);

            // Send loading message to content on tab
            send_loading_message(tab)
            .then(filter_undefined_responses)
            .then(function(response) {
                // Log tab response
                log_work(worker_id, 'received msg from '+ tab.id, response);
            })
            .catch(function(err) {
                handle_tab_messaging_errors(worker_id, err);
            });

        } else if (info.status === 'complete') { 

            // Send loading message
            log_work(worker_id, 'tab loaded | '+tab.id);
            send_loaded_message(worker_id, params, tab);
        }
        
    }
}


/**
 * Send message when tab is loading (onUpdated) to save and reset variables.
 * 
 * @param {String} worker_id The worker initiating the request
 * @param {Object} tab The tab object being updated
 * 
 * @memberof activity
 */
function send_loading_message(tab) {
    // Set loading message
    var loading_msg = {
        to: 'content',
        from: 'activity', 
        subject: 'tab_loading',
        save_mutations: true
    };

    // Send to content script in specified tab
    return send_tab_message(tab, loading_msg)
}


/**
 * Send message when tab is loaded (onUpdated) to collect HTML
 * 
 * @param {String} worker_id The worker initiating the request
 * @param {Monitor} params API params to pass to content
 * @param {Object} tab The tab object being updated
 * 
 * @memberof activity
 */
function send_loaded_message(worker_id, params, tab) {

    // Set updated activity
    var data = {
        wintab: [tab.windowId, tab.id].join('-'),
        lastwt: is_defined(ACTIVE.id) ? ACTIVE.id : '',
        type: 'updated',
        timestamp: timestamp()
    }

    // Send loading msg to confirm valid tab then send loaded msg
    check_tab_update_threshold(worker_id, tab)
    .then(send_loading_message)
    .then(filter_undefined_responses)
    .then(function(response) {
        
        // Injection successful, check and update URL
        data.url = response.tab_info.url;

        // Update last updated time
        LAST_UPDATE_TIME = timestamp();
    
        // Set loaded message
        var loaded_msg = {
            to: 'content',
            from: 'activity',
            subject: 'tab_loaded',
            api_params: params
        }
    
        // Send to content script in specified tab with delay
        return send_tab_message(tab, loaded_msg, SNAPSHOT_TIMEOUT)
    })
    .then(filter_undefined_responses)
    .then(function(response) {

        // Merge with existing data
        data = combine_dicts(data, response);

        // Send data back to worker for processing
        if (params.process) {
            message_worker({
                to: worker_id,
                from: 'background',
                subject: 'process',
                api_params: params,
                data: data
            });
        
        // Send data to server
        } else {
            save_data(worker_id, data, params.api)
            .then(log_json)
            .catch(function(error) {
                log_work_err(worker_id, 'error saving data', error)
            });
        }
    })
    .catch(function(err) {          
        // Handle errors
        if (err instanceof UpdateThresholdError) {
            // Update too recent, likely duplicate, no stack trace
            log_work(worker_id, err);

        } else {
            handle_tab_messaging_errors(worker_id, err);
        }
    });
}


// Error Handling --------------------------------------------------------------


function handle_tab_messaging_errors(worker_id, err) {
    if (is_defined(err)) {
        // Handle errors
        if (err instanceof IncongitoError) {
            // Ignoring incognito tab, no stack trace
            log_work(worker_id, err);
        } else if (err instanceof UndefinedResponseError) {
            // No response from tab, no stack trace
            log_work(worker_id, err);
        } else {
            // Unknown error, full stack trace
            log_work_err(worker_id, 'sending tab msg', err);
        }
    }
}


// Filter out incognito tabs by throwing custom error
function filter_incognito_tabs(tab) {
    if (tab.incognito) {
        // Ignore incognito tabs
        throw new IncongitoError('ignoring incognito');
    } else {
        // Continue with non-incognito tabs
        return tab
    }
}

// Error class for ignoring incognito tabs
class IncongitoError extends Error {
    constructor(message) {
      super(message);
      this.name = 'IncongitoError';
    }
}

// Check if response is defined
function filter_undefined_responses(response) {
    if (is_defined(response)) {
        return response;
    } else {
        throw new UndefinedResponseError('response undefined');
    }
}

// Error class for ignoring undefined responses
class UndefinedResponseError extends Error {
    constructor(message) {
      super(message);
      this.name = 'UndefinedResponseError';
    }
}

function check_tab_update_threshold(worker_id, tab) {
    
    return new Promise(function(resolve){ 

        // Check if tab update exceeds recency threshold (is a duplicate)
        var time_since_last = timestamp() - LAST_UPDATE_TIME;
        var recent_capture = time_since_last < THRESHOLD_RECENT;
        
        log_work(worker_id, 'time (ms) since last: ' + time_since_last);

        // If update is too recent, ignore, else message content script
        if (recent_capture) {
            throw new UpdateThresholdError('duplicate tab update');
        } else {
            log_work(worker_id, 'nonduplicate tab update')
            return resolve(tab) 
        }
    });


}

// Error class for ignoring incognito tabs
class UpdateThresholdError extends Error {
    constructor(message) {
      super(message);
      this.name = 'UpdateThresholdError';
    }
}


// Mutation Listener -----------------------------------------------------------

/**
 * Handle html update messages from content
 * 
 * @memberof activity
 */
function tab_mutation_listener(msg, sender, worker_id) {
    
    if (
        msg.to === 'activity' &&
        msg.from === 'content' && 
        msg.subject === 'tab_mutation' 
    ) {
        
        // Send data to server
        var api = 'activity';

        log_work(worker_id, 'received message from content', msg);

        save_data(worker_id, msg.data, 'activity')
        .then(log_json)
        .catch(function(error) {
            console.error('['+worker_id+'] saving data ['+api+']: \n' + error);
        });
    }
}
