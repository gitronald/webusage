/**
 * @file Worker: Google Account Activity.
 * @description Saves Google account activity from webpage. Must be logged in.
*/

importScripts('../../utils.js')
var WORKER_ID = 'google_activity'

// Set permissions and API parameters
var permissions = {}
var params = {
    api: 'website_history',
    history_type: 'incremental',
    websites: [
        {
            name: "google_activity",
            url:'https://myactivity.google.com/item?'
        }
    ],
    init_date: "2020-01-01 09:00:00",
    increment_interval: 1,  // size of increment (days)
}

// Receive a message
onmessage = function(event) {

    // Receive a message
    var msg = event.data
    check_message(msg, WORKER_ID)
    
    // Sends message with permission request.
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
