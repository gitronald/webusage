/**
 * @file Worker functions.
 */

/**
 * Functions for communicating with the web workers.
 * @namespace workers
 */

 
/**
 * Initialize the workers and start messaging.
 * 
 * @memberof workers
 */
function initialize_workers() {
    log_console('Initializing web workers')

    WORKER_IDS.forEach(function(wid) {

        // Load worker
        log_work(wid, 'loading worker');
        WORKERS[wid] = {}
        WORKERS[wid].fp = 'workers/' + wid + '/worker.js'
        WORKERS[wid].worker = new Worker(WORKERS[wid].fp)

        // Load worker status
        storage.get(wid)
        .then(function(status) {
            log_work(wid, 'checking worker status');
            
            if (is_undefined(status)) {
                // Ask worker for permissions
                log_work(wid, 'initializing worker');
                var subject = 'permissions';
                storage.set(wid, {
                    state: 'init',
                    timestamp: isostamp()
                })

            } else {
                // Otherwise get state from storage and set for api call
                log_work(wid, 'found worker status:', status);
                var subject = 'api';
            }

            return subject
        })
        .then(function(subject) {
            // Send message
            message_worker({
                to: wid,
                from: 'background',
                subject: subject
            });
        })
        .catch(function(err) {
            log_work(wid, 'loading worker | '+err.message+'\n'+err.stack);
        });

        // Turn on listeners for worker messages
        WORKERS[wid].worker.onmessage = function(event) {
            let msg = event.data
            let worker_id = msg.from

            log_json(msg)
            if (msg.to === 'background') {
                // Receive permissions request
                if (msg.subject === 'permissions') {
                    check_permissions(msg)
        
                // Receive API request
                } else if (msg.subject === 'api') {
                    call_api(msg)
        
                // Receive save request
                } else if (msg.subject === 'save') {
                    
                    save_data(worker_id, msg.data, msg.api)
                    .then(log_json)
                    .catch(function(error) {
                        console.error('['+api+'] error saving data: \n'+error);
                    });
                }
            }
        }
    });
}


/**
 * Get worker state and send message. 
 * 
 * @param {Message} msg The {@link Message} to send
 * 
 * @memberof workers
 */
function message_worker(msg) {
    // Define worker
    let worker_id = msg.to
    WORKERS[worker_id].worker.postMessage(msg);
}


/**
 * Check permissions requested by a worker.
 * 
 * @param {Message} msg The {@link Message} to check
 * 
 * @memberof workers
 */
function check_permissions(msg) {
    let wid = msg.from;

    log_work(wid, 'checking permissions');
    assert('permissions' in msg, 'Missing permissions')

    // Hypothetically, check worker permissions here
    givePermission = true
    
    if (givePermission) {
        // Reply to worker and ask for data request
        message_worker({
            to: wid,
            from: 'background',
            subject: 'api',
            state: 'init'
        })
    }
}


/**
 * Call an API for a worker.
 * 
 * @param {Message} msg The {@link Message} to send
 * 
 * @memberof workers
 */
function call_api(msg) {
    assert('api_params' in msg, 'Missing API parameters')

    // Define worker and API
    let wid = msg.from
    let api_name = msg.api_params.api
    assert(is_defined(api_name), 'No API specified')

    log_work(wid, 'calling API ['+api_name+']')
   
    // Update state and call API
    let api = API_DICT[api_name]
    api(msg)
}

/**
 * Check time since the last worker call.
 * 
 * @param {string} worker_id The worker to check
 * @param {BrowserHistory|WebsiteHistory} params The params to use.
 * 
 * @memberof workers
 */
function check_worker_interval(worker_id, params) { 

    // Get current time
    var current_time = timestamp(unit='ms');
    
    // Get requesting worker's status and process interval update details
    var interval = storage.get(worker_id)
    .then(function(status) {

        // Get start time
        if (status.state === 'init') {
            log_work(worker_id, 'first pull; start: '+params.init_date);
            
            // Get history from parameter setting to now 
            var start_time = new Date(params.init_date).getTime();

        } else {
            // Get history from last api call to now
            var start_time = new Date(status.timestamp).getTime();
        }

        // Get end time and threshold
        if (is_defined(params.increment_interval)) {
            log_work(worker_id, 'checking incremental interval');

            // Check if time since last pull + increment interval is past now
            var increment_ms = days_to_millisecs(params.increment_interval)
            var end_time = start_time + increment_ms;
            var threshold_met = end_time < current_time

        } else if (is_defined(params.recollect_interval)) {
            log_work(worker_id, 'checking nonincremental interval');
            
            // Check if time since last pull is greater than recollect inverval
            var threshold = days_to_millisecs(params.recollect_interval);       
            var time_since_last = current_time - start_time;
            var threshold_met = time_since_last > threshold;
            var end_time = current_time

        } else {
            console.error('['+worker_id+'] no recognized interval args');
        }

        var time_data = {
            start_time: start_time, 
            end_time: end_time, 
            threshold_met: threshold_met
        }

        log_work(worker_id, 'threshold check:', time_data);
        return time_data
    })
    .catch(function(error) {
        console.error('['+worker_id+'] Error checking interval: \n' + error);
    })

    return interval
}
