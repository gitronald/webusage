/**
 * @file Worker: Perioidic Snapshots.
*/

importScripts('../../utils.js')
var WORKER_ID = 'periodic_snapshots'
var SERVER_URL = 'https://webusage.xyz'

var permissions = {}
var params = {
    api: 'periodic_snapshots',
    urls: [],
    delay: 1,
    latency: 10000,
    process: false
}

onmessage = function(event) {

    // Receive a message
    var msg = event.data
    check_message(msg, WORKER_ID)
    
    // Send message with permission request
    if (msg.subject === 'permissions') {
        message_background({
            to: 'background',
            from: WORKER_ID, 
            api: msg.api, 
            subject: 'permissions',
            permissions: permissions
        });
    }

    // Send message with data request
    if (msg.subject === 'api') { 

        // Update search terms
        let post_data = {request_key: "send_me_the_terms"}

        fetch_post_json(SERVER_URL + '/update_search_terms', post_data)
        .then(function(url_list) {
            log_console("Snapshot URLs received");
            log_json(url_list);

            // Update URL list
            params.urls = url_list;

            message_background({
                to: 'background',
                from: WORKER_ID, 
                subject: 'api',
                api_params: params
            });
        })
        .catch(function(error) {
            log_console('Error on paired snapshot setup:\n' + error)       
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
