/**
 * @file API: Browsing History.
*/

/**
 * Functions for getting internal browser history.
 * @namespace browser_history
 */

/**
 * Browser History API Parameters.
 * 
 * @typedef {Object} BrowserHistory
 * 
 * @property {string} search A string to search for (empty string collects all).
 * @property {Array} domains The domains to collect history for.
 * @property {number} recollect_interval Number of days between collections.
 * @property {number} init_date Inital start date.
 * @property {number} increment_interval Size of time gap to increment
 * @property {number} max_results Maximum browsing history items.
 * @property {boolean} process Send data back to worker for post processing.
 * 
 * @memberof browser_history
 */

// Interval for saving history batches
var BH_SAVE_INTERVAL = 1000 * 5

/**
 * Get the browser history.
 * 
 * @param {Message} msg The message received from a worker.
 * @param {BrowserHistory} msg.params {@link BrowserHistory} API parameters
 * 
 * @memberof browser_history
 */
function api_browser_history(msg) {
    log_console('Browser History API');

    var worker_id = msg.from
    var params = msg.api_params
    
    assert(params.api === 'browser_history', 'Message sent to wrong API')
    log_json(params)
    
    // Check data collection interval
    check_worker_interval(worker_id, params)
    .then(function(interval) {

        if (interval.threshold_met) {
            // Time threshold between crawls met, search for browser history
            history_search(params, interval, msg)

        }
        
    })
    .catch(function(error) {
        console.error('Error on API Browser History: \n' + error)
    })
}

/**
 * Recollect browsing history if set interval threshold is met
 * 
 * @param {BrowserHistory} params The API parameters. 
 * @param {Object} interval Dict with start and end time to use in search
 * @param {Message} msg The message to pass along
 * 
 * @memberof browser_history
 */
function history_search(params, interval, msg) {

    var worker_id = msg.from

    // Search browser history
    browser.history.search({
            text: params.search,
            startTime: interval.start_time,
            endTime: interval.end_time,
            maxResults: params.max_results
    })
    .then(function(historyItems) {

        log_work(worker_id, 'history items: '+historyItems.length);

        // Filter out urls with no domain match
        var domains = params.domains;
        var filtered = filter_strings(historyItems, 'url', domains);
        var n_items = filtered.length
        
        if (n_items > 0) {
            // Process items if they exist
            log_work(worker_id, 'filtered items: ' + n_items);
            process_history_items(filtered, interval, msg);

        } else {

            // Save interval as complete
            log_work(worker_id, 'saving increment complete');

            storage.set(worker_id, {
                state: 'complete',
                timestamp: new Date(interval.end_time).toISOString()
            })
            .then(function() {

                // Call API again with new interval after wait time
                setTimeout(function() {
                    api_browser_history(msg);
                }, BH_SAVE_INTERVAL);
                
            });
        }
    });
}


/**
 * Get visitItems for a list of historyItems
 * 
 * @param  {Array} historyItems The history items found.
 * @param  {String} worker_id The worker id that initialized the process.
 * 
 * @memberof browser_history
 */
function process_history_items(historyItems, interval, msg) {
    
    // Define item params
    var worker_id = msg.from

    var history_visits = [];

    // Iterate over history items
    historyItems.forEach(function(historyItem, index) {
        
        // Get individual visitItems
        browser.history.getVisits({ 
            url: historyItem.url 
        })
        .then(function(visitItems){
            
            // Combine historyItem and visitItems
            historyItem.visits = visitItems
            
            // Append history item and visits
            history_visits.push(historyItem)
            
            // On the last item
            if (index === historyItems.length - 1) {
    
                // Save data
                save_data(worker_id, history_visits, 'browser_history')
                .then(function(response) { 
                    log_json(response);
            
                    // If the response is a success
                    if (response.hasOwnProperty('success')) {
            
                        // Save as complete
                        log_work(worker_id, 'increment complete');
                        storage.set(worker_id, {
                            state: 'complete',
                            timestamp: new Date(interval.end_time).toISOString()
                        })
                        .then(function() {    

                            // Call API again with new interval
                            setTimeout(function() {
                                api_browser_history(msg)
                            }, BH_SAVE_INTERVAL);
                            
                        })
                    }
                })
                .catch(function(error) {
                    console.error('['+worker_id+'] Error saving data:\n' + error)
                });
            }
        });

    });
}