/**
 * @file Content Script - Snapshot API.
 */

// Listen for snapshot messages
browser.runtime.onMessage.addListener(snapshot_listener);

/**
 * Listen for messages from snapshot API
 * 
 * @memberof snapshot
 */
function snapshot_listener(msg, sender) {

    if (msg.from === "periodic_snapshots") {
        log_console(msg)

        // Store tab meta data
        TAB_DATA = msg.tab_info

        // Store tab URL and HTML
        TAB_DATA.url = document.URL;
        TAB_DATA.html = document.all[0].outerHTML;

        // Send tab data to background
        return new Promise(function(resolve){ return resolve(TAB_DATA) });
    }
}
