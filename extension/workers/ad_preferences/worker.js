/**
 * @file Worker: Ad Preferences
*/

importScripts('../../utils.js')
var WORKER_ID = 'ad_preferences'

// Set permissions and API parameters
var permissions = {}
var params = {
    api: 'website_history',
    history_type: 'complete',
    websites: [ // List of URLs to query to collect Ads preference.
        {
            name: 'bluekai',
            url: 'https://o.bluekai.com/registry'
        },
        {
            name: 'google_ads',
            url: 'https://adssettings.google.com/authenticated'
        }
    ],
    recollect_interval: 7,
    init_date: "2019-04-01 09:00:00",
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
            subject: 'permissions',
            permissions: permissions
        });
    }
    
    // Permission accepted, sends message with data request.
    if (msg.subject === 'api') {

        message_background({
            to: 'background',
            from: WORKER_ID, 
            subject: 'api',
            api_params: params
        });
    }

    // Send message with processed data
    if (msg.subject === 'process') {
        
        // Optional processing of the request data
        var processed = msg.data

        // Save processed data
        message_background({
            to: 'background',
            from: WORKER_ID, 
            subject: 'save',
            api: params.api,
            wid: WORKER_ID,
            data: processed,            
        });
    }

};
