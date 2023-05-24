/**
 * @file Popup script
*/

// Log to Background Script.
var bkg = chrome.extension.getBackgroundPage();

// Listen for popup load
document.addEventListener('DOMContentLoaded', function() {

    // Start snapshot listener
    // snapshot.setup();

    // Add version to description
    var version = chrome.runtime.getManifest().version;
    var elem = document.getElementById('version');
    elem.innerText = 'Version: '+ version;
    elem.innerText += ' | ID: ' + bkg.USER.user_id;
});


// TOGGLES ---------------------------------------------------------------------

function get_current_url(tabs) {
    // Get current URL
    try {
        return tabs[0].url;
    }
    catch (err) {
        bkg.console.log('Error getting current URL')
        return '';
    }
}

// Snapshot toggle
var snapshot = {

    msg: {
        to: 'background',
        from: 'popup',
        subject: 'api'
    },

    // On click function
    on_handler : function(e) {
        bkg.console.log('Registering popup click')

        // Get current URL
        chrome.tabs.query({
            active: true, 
            lastFocusedWindow: true
        }, function (tabs) {

            // Set API parameters
            snapshot.msg.api_params = {
                api: 'snapshot',
                url: get_current_url(tabs),
                // tab_id: active_tab,
                new_window: false,
                new_tab: false,
                incognito: false,
                process: false
            }

            // Send to background
            chrome.runtime.sendMessage(snapshot.msg,
                function(response){
                    console.log('Sent message')
                }
            );
        }); 
    },

    setup: function() {
        var element = document.getElementById('take_snapshot');
        element.addEventListener('click',  snapshot.on_handler);
    }
}

// EXAMPLES --------------------------------------------------------------------

// Send/receive message
// chrome.runtime.sendMessage({
//         data:"Handshake"
//     },
//     function(response){
//         console.log('Receiving message from background')
//         console.log(response)
//     }
// );

// Receive message
// chrome.runtime.onMessage.addListener(
//     function(message, sender, sendResponse){
//         console.log('Receiving message from background')
//         str = JSON.stringify(message.data);
//         sendResponse(str)
// });
