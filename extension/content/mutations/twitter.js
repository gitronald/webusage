/**
 * @file Mutations Observer: Twitter
 */


/**
 * Add Twitter observer when newsfeed is present and send data on close.
 * 
 * @memberof dom_observers
 */
function add_twitter_observer() {
    log_console('Adding Twitter Scroll Observer')

    // Select target element and check if it exists
    var selector = '[data-testid="primaryColumn"]';
    var targetNode = document.querySelector(selector);
    
    if (!targetNode) {
        // The node we need does not exist yet - wait and try again
        window.setTimeout(add_twitter_observer, 500);
        return;
        
    } else {
        // Configure and set DOM mutation observer
        HTML_OBSERVER = new MutationObserver(filter_twitter_mutations);
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

/**
 * Filter for Twitter mutations based on divs and handles
 * 
 * @param {Object} mutations A MutationObserver return
 * 
 * @memberof dom_observers
 */
function filter_twitter_mutations(mutations) {    
    
    // Match pattern for Twitter handles e.g. @rerobertson
    var twitter_handle_regex = /@([A-Za-z0-9_]+)/g

    // Filter for mutations containing HTML nodes added in childList div
    mutations.forEach(function(mutation) {
        if ( 
            mutation.type === 'childList' && 
            mutation.target.tagName === 'DIV' &&
            mutation.addedNodes.length > 0
        ) {
            // Filter for nodes contain a twitter handle
            mutation.addedNodes.forEach(function(node) {
                if (
                    node.tagName === 'DIV' && 
                    node.textContent.match(twitter_handle_regex)
                ) {
                    if (DEBUG.mutations) {
                        log_console('New Twitter div')
                        log_console(mutation)
                    }
                    // Add div HTML to save list 
                    HTML_UPDATES.push(node.outerHTML)
                }
            })
        }
    });
}