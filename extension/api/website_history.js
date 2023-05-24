/**
 * @file API: Website History.
*/

/**
 * Snapshot Functions
 * @namespace website_history
 */

/**
 * Website History API Parameters.
 * 
 * @typedef {Object} WebsiteHistory
 * 
 * @property {Array} websites List of website dicts containing name and url
 * @property {string} history_type Complete history or incremental
 * @property {number} recollect_interval Number of days between collections
 * @property {number} init_date The start time for incremental history
 * @property {number} increment_interval Size of time gap to increment
 * @property {boolean} process Send data back to worker for post processing
 * 
 * @memberof website_history
 */

// Save interval for website history
var WH_SAVE_INTERVAL = 1000 * 5

/**
 * Get a complete or incremental website history.
 * 
 * @param {Message} msg The message received from a worker.
 * @param {WebsiteHistory} msg.params API parameters
 * 
 * @memberof website_history
 */
function api_website_history(msg) {
    log_console('Website History API');

    let worker_id = msg.from
    let params = msg.api_params
    
    log_work(worker_id, 'called:', params);
    assert(params.api === 'website_history', 'Message sent to wrong API');

    let history_type = params.history_type

    // Check data collection interval
    check_worker_interval(worker_id, params)
    .then(function(interval) {
        
        // If gap of days in satisfied
        if (interval.threshold_met) {

            if (history_type === 'complete') {

                // Capture complete histories
                get_complete_history(msg);

            } else if (history_type === 'incremental') {

                // Check account login status
                storage.get('accounts')
                .then(function(accounts) {
                    if (accounts.google.login) {
                        
                        // Capture incremental history (requires login)
                        get_incremental_history(msg, interval);

                    } else {
                        log_work(worker_id, "not logged in; skipping");
                    }
                })
            }
        }
    })
    .catch(function(error) {
        console.error('['+worker_id+'] error \n' + error);
    })
}


/**
 * Get complete website history if time interval since last pull has passed.
 * 
 * @param {Message} msg The message received from a worker.
 * @param {WebsiteHistory} msg.params API parameters
 * 
 * @memberof website_history
 */
function get_complete_history(msg, status) {

    let worker_id = msg.from
    let params = msg.api_params

    let websites = params.websites;
    let n_urls = websites.length;

    log_work(worker_id, 'websites', websites);

    websites.forEach(function(website, index) {
        
        // Set state on last url
        let final_url = (index + 1 === n_urls);
        
        // Stagger wait times (otherwise all fire at same time)
        let wait_time = WH_SAVE_INTERVAL * (index + 1)

        // Set function to run after wait time passes
        setTimeout(function() {
            fetch_get(website.url)
            .then(function(response_text) {
                
                // Save status on last url
                if (final_url) {
                    log_work(worker_id, 'completed');

                    // Make completed state
                    var state = {
                        state: 'complete',
                        timestamp: isostamp()
                    }

                    // Save request and update state
                    save_request(msg, website, response_text, state)

                } else {

                    // Save without updating state
                    save_request(msg, website, response_text)
                }
            })
            .catch(function(err) {
                log_work(worker_id, 'error saving |' + err +'\n'+err.stack);
            });

        }, wait_time); // Wait between requests
    });
}


/**
 * Get incremental website history by advancing locally stored time params.
 * 
 * @param {Message} msg The message received from a worker.
 * @param {WebsiteHistory} msg.params API parameters
 * 
 * @memberof website_history
 */
function get_incremental_history(msg, interval) {

    var worker_id = msg.from;
    var params = msg.api_params;
               
    // Time threshold between crawls met, recollect pages
    let website = clone_object(params.websites[0]);
        
    // Set URL params and convert to microseconds
    website.url += 'min=' + interval.start_time * 1000;
    website.url += '&max=' + interval.end_time * 1000;

    // Set function to run after wait time passes
    setTimeout(function() {
        
        // GET website URL
        log_work(worker_id, "getting: " + website.url)
        fetch_get(website.url)
        .then(function(response_text) {

            log_work(worker_id, 'processing:', website);
            if (response_text) {
                if (website.name === 'google_activity') {  
                    // Google activity extraction
                    var html = extract_google_activity(response_text);
                } else {
                    // Other HTML data
                    var html = response_text;
                }
            }

            return html
        })
        .then(function(html) {

            // Worker state to set if save successful
            var state = {
                state: 'complete',
                timestamp: new Date(interval.end_time).toISOString()
            }
            
            // Save request
            save_request(msg, website, html, state)

        })
        .catch(function(error) {
            var prefix = "["+worker_id+"] "
            console.error(prefix + "error saving incremental\n" + error)
        });
    }, WH_SAVE_INTERVAL); // Wait between requests
}

/**
 * Parse google activity list from html string.
 * 
 * @param {string} html response text from a fetch get
 * 
 * @memberof website_history
 */
function extract_google_activity(html) {
    log_console('[google_activity] extracting HTML');

    // Convert HTML string to DOM element
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, 'text/html');
    
    // Parse account history section
    var div = doc.querySelector('[role="list"]')
    if (div) {
        return div.innerHTML
    }
}


// 
/**
 * Process fetch request
 * 
 * @param {Message} msg The worker message
 * @param {Object} website A dict with keys name and url
 * @param {string} html The html response text
 * @param {Object} state A dict with keys worker_id and timestamp
 * 
 * @memberof website_history
 */
function save_request(msg, website, html, state) {
    
    var worker_id = msg.from;
    var params = msg.api_params;
    var history_type = params.history_type;

    // If there is a response, send it.
    if (
        (typeof html === 'string' || html instanceof String) &&
        html != ''
    ) {
        log_work(worker_id, 'HTML found')
    
        let data = {
            html: html,
            url: website.url,
            name: website.name
        }

        // Send data to server
        save_data(worker_id, data, params.api)
        .then(filter_undefined_responses)
        .then(function(response) {

            // Log server response
            log_work(worker_id, 'received server response', response);

            // If response successful
            if (response.hasOwnProperty('success')) {

                // If a state is provided 
                if (is_defined(state)) {

                    // Set worker state
                    storage.set(worker_id, state)
                    .then(function() {

                        // If history type is incremental
                        if (history_type === 'incremental') {

                            // Retrigger API to launch next increment
                            api_website_history(msg)
                        }
                    })

                }
            }

        })
        .catch(function(err) {
            if (err instanceof UndefinedResponseError) {
                // No response from tab, no stack trace
                log_work(worker_id, err);
            } else {
                console.error('['+worker_id+'] error saving data: \n'+err)
            }    
        });

    } else { 
        
        // If there is no HTML 
        log_work(worker_id, 'no HTML');
        
        // If a state is provided 
        if (is_defined(state)) {

            // Set worker state and retrigger API
            storage.set(worker_id, state)
            .then(function() {

                // If history type is incremental
                if (history_type === 'incremental') {

                    // Retrigger API to launch next increment
                    api_website_history(msg)
                }
            })
        }
    }
}

