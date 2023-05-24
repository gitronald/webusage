/**
 * @file API: Snapshot
 */

/**
 * Snapshot Functions
 * @namespace snapshot
 */

/**
 * Periodic Snapshot API Parameters.
 * 
 * @typedef {Object} PeriodicSnapshot
 * 
 * @property {Array} urls The URLs to snapshot.
 * @property {string} delay The delay from startup to first snapshot.
 * @property {number} latency Milliseconds between each snapshot in a batch.
 * @property {number} interval Minutes between each batch of snapshots.
 * @property {boolean} process Send data to worker before saving.
 * 
 * @memberof snapshot
 */

// Array used to track active snapshot tabs and avoid Activity duplicates
var GENERATED_TABS = [];

 /**
 * Set alarm to take a snapshot of the DOM on a new or existing tab.
 * 
 * @param {Message} msg The message received from a worker
 * @param {PeriodicSnapshot} msg.params Periodic Snapshot API parameters
 * 
 * @memberof snapshot
 */
function api_periodic_snapshots(msg) {
    log_console('Periodic Snapshot API');
    
    var worker_id = msg.from;
    var params = msg.api_params;

    assert(params.api === 'periodic_snapshots', 'Message sent to wrong API');
    log_json(params);

    // Retrieve worker id from storage
    storage.get(worker_id)
    .then(function(status) {
        
        // Get current and last status date
        let current_date = new Date();
        let last_date = new Date(status.timestamp);
        log_print(worker_id, [current_date, last_date]);

        // Check if alarm has fired today        
        if (is_match_date(current_date, last_date)) {
        
            // Check if state is complete
            if (status.state === 'complete') {
                log_work(worker_id, 'completed', status);

            // Or in progress
            } else if (status.state === 'in_progress') {
                log_work(worker_id, 'setting alarm in progress', status);
                
                // Update index for the last url this api ended on
                params.url_idx = status.url_idx;
                set_snapshots_alarm(worker_id, params);

            } else if (status.state === 'init') {
                log_work(worker_id, 'setting alarm initial', status);

                // Set index to zero
                params.url_idx = 0;
                set_snapshots_alarm(worker_id, params);
            }
                
        // Or new
        } else {
            log_work(worker_id, 'setting alarm new', status);

            // Set index to zero
            params.url_idx = 0;
            set_snapshots_alarm(worker_id, params);
        }
    })
}

function set_snapshots_alarm(worker_id, params) {

    // Create notification message for user
    create_snapshot_notification(worker_id, params);

    // Create alarm to run snapshots
    create_alarm_snapshot(worker_id, params);
    
}


function create_snapshot_notification(worker_id, params) {

    // Set notification
    var notify_id = 'snapshot_notification'
    var notify = {
        'type': 'basic',
        'iconUrl': browser.runtime.getURL('icons/icon48.png'),
        'title': 'Snapshots',
        'message': 'In ' + params.delay + ' minutes, two browser windows will open and begin taking snapshots of websites. Please do not close these windows, they will close automatically when done.'
    }

    // Create notification
    browser.notifications.create(notify_id, notify)
    .then(function(id) {
        log_work(worker_id, 'notification created: ' + id);
    });
}

// Create alarm
function create_alarm_snapshot(worker_id, params) {

    log_work(worker_id, 'creating alarm');
    browser.alarms.create(worker_id, {
        delayInMinutes: params.delay
    });

    // Set alarm listener
    browser.alarms.onAlarm.addListener(function listener(alarm) {
        log_console('Alarm ['+alarm.name+'] fired at: '+new Date());
        
        // Listener for set alarm.
        if (alarm.name === worker_id) {

            // Set status to in progress
            storage.set(worker_id, {
                state: 'in_progress',
                url_idx: 0,
                timestamp: timestamp()
            })

            // Launch paired snapshots
            paired_snapshots(worker_id, params);

            // Remove listener
            browser.alarms.onAlarm.removeListener(listener);
        }
    });
}

/**
 * Retrieve current list of URLs from the server to snapshot
 * 
 * @param {Message} msg 
 * 
 * @memberof snapshot
 */
function paired_snapshots(worker_id, params) {

    // Paired snapshots
    if (INCOGNITO_ALLOWED) {
        snapshot_batch(worker_id, params, false) // standard
        snapshot_batch(worker_id, params, true)  // incognito
    } else {
        log_work(worker_id, 'incognito mode not allowed, cancelling')
        // TODO:
        // launch_survey('./pages/incognito.html');
    }

}

/**
 * Create a new window, take a batch of snapshots, and close window when done.
 * 
 * @param {Message} msg The {@link Message} to process.
 * @param {boolean} incognito Open window in incognito or standard mode
 * 
 * @memberof snapshot
 */
function snapshot_batch(worker_id, params, incognito) {

    log_work(worker_id, 'snapshot batch', params)

    // Create a new window
    create_window(incognito)
    .then(function(new_window) {
        
        // Define new window and tab ID
        var win_id = new_window.id
        var tab_id = new_window.tabs[0].id

        // Minimize window and display notification webpage.
        browser.windows.update(win_id, { state: 'minimized' });
        browser.tabs.update(tab_id, { url: SERVER_URL + '/taking_snapshots' });

        // Define URL params
        var urls = params.urls;
        var url_idx = params.url_idx;

        // Filter urls already completed today
        var urls_filter = urls.slice(url_idx);
        log_print('[url list]', {
            urls: urls,
            urls_filter: urls_filter,
            url_idx:url_idx
        })

        urls_filter.forEach(function(url, index){

            // Always close tabs and close window on last url
            let remove_tab = true;
            let remove_win = (index + 1 === urls_filter.length);
            
            // Stagger wait times (otherwise all fire after `params.latency`)
            let wait_time = params.latency * (index + 1)
            
            // Set function to run after wait time passes
            setTimeout(function() {

                // Set params for url
                var updated_params = clone_object(params);
                updated_params['remove_tab'] = remove_tab;
                updated_params['remove_win'] = remove_win;
                updated_params['root_tab'] = tab_id;
                updated_params['incognito'] = incognito;
                updated_params['url_idx'] = url_idx + index
                                
                // Snapshot HTML
                take_snapshot(url, win_id, updated_params, worker_id);

            }, wait_time); // Wait between snapshots

        });
        
    });
}

/**
 * Create a new browser window.
 * 
 * @param {boolean} incognito Open window in incognito or standard mode
 * 
 * @memberof snapshot
 */
function create_window(incognito) {

    return browser.windows.create({ incognito: incognito })
        .catch(function(error) {
            log_console('error creating window:\n' + error);
        });
}


/**
 * Create a new browser tab in a select window and pass message.
 * 
 * @param {String} url The URL to open the new tab to
 * @param {number} win_id The window to create the tab in
 * 
 * @memberof snapshot
 */
function create_tab(url, win_id) {

    // Create new tab
    return browser.tabs.create({ 
        windowId: win_id,
        url: url,
        active: false
    })
    .then(track_generated_tab)
    .catch(function(error) {
        log_console('error creating tab: \n' + error);
    });
}

function track_generated_tab(tab) {
    // Track extension generated tabs
    if (!tab.incognito) {
        GENERATED_TABS.push(tab.id)
    }
    return tab
}

/**
 * Open a new tab in a specified window and take a snapshot when it loads.
 * 
 * @param {Message} msg The {@link Message} to process
 * @param {number} win_id A window ID to create the tab in
 * 
 * @memberof snapshot
 */
function take_snapshot(url, win_id, params, worker_id) {
    
    // Set listener to remove new non-incognito history on this url
    if (!params.incognito) {

        // Add listener to remove snapshot history
        browser.history.onVisited.addListener(function(historyItem) {
            snapshot_history_listener(historyItem, url, worker_id)
        });
    }

    // Create a new tab on specified window ID
    create_tab(url, win_id)
    .then(function(new_tab) {

        // Listen for new tab to load
        browser.tabs.onUpdated.addListener(function(tabId, info) {
            snapshot_listener(tabId, info, new_tab, params, worker_id)
        });
    });
}

function snapshot_listener(tabId, info, new_tab, params, worker_id) {

    // Check if tab id matches and the tab has completed loading
    if (
        tabId == new_tab.id && 
        info.status == 'complete'
    ) {

        // Message to content script
        tab_msg = {
            to: 'content',
            from: worker_id,
            subject: 'snapshot',
            api_params: params
        }

        // Send the message after a delay
        send_tab_message(new_tab, tab_msg, SNAPSHOT_TIMEOUT)
        .then(filter_undefined_responses)
        .then(function(response) {
            // Handle response
            handle_snapshot_response(worker_id, params, response);
        })
        .catch(function(err) {
            handle_tab_messaging_errors(worker_id, err)
        });

        // Remove listener
        browser.tabs.onUpdated.removeListener(snapshot_listener);
    }
}


/**
 * Listen for changes to browser history that match snapshot.
 * 
 * @param {Object} historyItem A history api item
 * @param {String} url A url to check for a match with
 * 
 * @memberof snapshot
 */
function snapshot_history_listener(historyItem, url, worker_id) {

    if (is_match(historyItem.url, url)) {

        log_work(worker_id, 'found snapshot history', historyItem)

        // Get deletion range from using visit time +/- 1 ms (FF only takes int)
        var visit_time = historyItem.lastVisitTime
        var range = {
            startTime: visit_time - 1, 
            endTime: visit_time + 1
        }

        // Delete item
        browser.history.deleteRange(range)
        .then(function() { 
            log_work(worker_id, 'removed history: '+ url);
        })
        .catch(function(err) { 
            log_work_err(worker_id, 'error deleting history', err);
        })

        // Remove self
        browser.history.onVisited.removeListener(snapshot_history_listener)
    }
}

/**
 * Handle responses to content message
 * 
 * @param {Object} params API paramaters being executed 
 * @param {Object} response The response from the content script
 * 
 * @memberof content
 */
function handle_snapshot_response(worker_id, params, response) {

    log_work(worker_id, 'response from content', response);
    
    var data = response;
    var tab_id = Number(data.wintab.split('-')[1]);
    data.pop('lastwt') // Drop last wintab variable

    // Set worker progress
    storage.set(worker_id, {
        state: 'in_progress',
        url_idx: params.url_idx,
        timestamp: timestamp()
    })

    // Close tab if specified
    if (params.remove_tab) {

        // Stop tracking this tab
        var item_index = GENERATED_TABS.indexOf(tab_id);
        if (item_index > -1) {
            // Remove from list by index
            GENERATED_TABS.splice(item_index, 1);
        }

        browser.tabs.remove(tab_id);
    }

    // On last URL
    if (params.remove_win) {

        // Close window
        log_console('Removing : ' + params.root_tab);
        browser.tabs.remove(params.root_tab);

        // Save status as complete
        log_work(worker_id, 'complete');
        storage.set(worker_id, {
            state: 'complete',
            timestamp: isostamp()
        });
    }

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
            console.error('['+worker_id+'] saving data ['+params.api+']: \n' + error)
        });
    }
}
