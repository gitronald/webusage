/**
 * @file Worker: Passive Monitor
*/

importScripts('../../utils.js')
var WORKER_ID = 'passive_monitor'

// Set permissions and API parameters
var permissions = {}
var params = {
    api: 'activity',
    // matches: "*://*.google.com/search*q=*",
    domains: [   // Limit domains.
        'youtube.com',
        'google.com/search',
        'facebook.com',
        'news.google.com',
        'twitter.com/home',
        'twitter.com/search',
        'twitter.com/explore'
    ],
    html_updates: true,
    process: false
}

// Listen for messages
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
    
    // Send message with data request
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
        
        // TODO: Process the snapshot
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

}
