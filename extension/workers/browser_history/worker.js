/**
 * @file Worker: Browser History.
*/

importScripts('../../utils.js')
var WORKER_ID = 'browser_history'

// Set permissions and API parameters
var permissions = {}
var params = {
    api: 'browser_history',
    search: '',  // No search term
    domains: [], // No domain filter
    init_date: "2020-01-01 09:00:00",
    increment_interval: 10,  // Collect n days if n days since last
    max_results: 100000,
    process: false
}

// Receive a message
onmessage = function(event) {

    // Receive a message
    var msg = event.data
    check_message(msg, WORKER_ID)
    
    // Send message with permission request
    if (msg.subject === 'permissions') {
        message_background({
            to: 'background',
            from: WORKER_ID, 
            subject: 'permissions',
            permissions: permissions
        });
    }
    
    // Permission accepted, sends message with data request.
    if (msg.subject === 'api') {
        // Send message with data request
        message_background({ 
            to: 'background',
            from: WORKER_ID, 
            subject: 'api',
            api_params: params
        });
    }

    // Send message with processed data
    if (msg.subject === 'process') {
        
        // TODO: Process the snapshot
        var processed = msg.data

        // Save processed data
        message_background({
            to: 'background',
            from: WORKER_ID, 
            subject: 'save',
            api: params.api,
            wid: WORKER_ID,
            data: processed
        });
    }

};
