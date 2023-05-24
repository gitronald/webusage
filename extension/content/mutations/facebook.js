/**
 * @file Mutations Observer: Facebook
 */

/**
 * Add Facebook observer when newsfeed is present.
 * 
 * @memberof dom_observers
 */
function add_facebook_observer() {
    log_console('Adding Twitter Scroll Observer')

    // Select target element and check if it exists
    var selector = '[role="feed"]';
    var targetNode = document.querySelector(selector);
    
    if (!targetNode) {
        // The node we need does not exist yet - wait and try again
        window.setTimeout(add_facebook_observer, 500);
        return;
        
    } else {
        // Configure and set DOM mutation observer
        HTML_OBSERVER = new MutationObserver(filter_facebook_mutations);
        HTML_OBSERVER.observe(targetNode, {childList: true, subtree: true});
        
        // Periodically check save size thresh
        HTML_UPDATE_INTERVAL_ID = setInterval(
            check_for_html_updates, 
            HTML_UPDATE_INTERVAL_TIME
        ) 
        
        // Send updated divs if/when tab is closed
        window.onunload = save_html_updates;
    }
}


// FB Update observer notes
// Newsfeed updates: 
// target = <div role="feed">
// Look for new data-testid="fbfeed_story"

// Side ads:
// Look for:
//  - tagName = "DIV" && target.id = "pagelet_ego_pane" OR
//  - target.parentNode.className === "home_right_column"
//  - target.dataset.testid === "fbfeed_story"
//  - node.attributes <- list -> [i.name === data-testid && value == 'fbfeed_story']

 /**
 * Filter for Facebook mutations.
 * 
 * @param {Object} mutations A MutationObserver return
 * 
 * @memberof dom_observers
 */
function filter_facebook_mutations(mutations) {
    log_console('saw ' + mutations.length + ' mutations');

    mutations.forEach(function(mutation) {
        if ( // Nodes added in childList div
            mutation.type === 'childList' && 
            mutation.target.tagName === 'DIV' &&
            mutation.addedNodes.length > 0
        ) {
            mutation.addedNodes.forEach(function(node) {
                
                if ( // Added node is a div and contains a twitter handle
                    node.tagName === 'DIV' //&&
                    // node.dataset.testid === "fbfeed_story"
                ) {
                    log_console('div added')
                    log_console(mutation)
                    // Add div HTML to save list 
                    fb_updates.push(node.outerHTML)
                }
            })
        }
    })
}
// add_facebook_observer(fb_target, fb_observer_config)

