/**
 * @file Mutations Observer: YouTube
 */

/**
 * Add YoutTube mutation observer.
 * 
 * @memberof dom_observers
 */
function add_youtube_observer() {
    log_console('Adding YouTube Scroll Observer')

    // Configure and set DOM mutation observer
    HTML_OBSERVER = new MutationObserver(filter_youtube_mutations);
    HTML_OBSERVER.observe(document.body, {childList: true, subtree:true });
    
    // Periodically check save size thresh
    HTML_UPDATE_INTERVAL_ID = setInterval(
        check_for_html_updates, 
        HTML_UPDATE_INTERVAL_TIME
    ) 
    
    // Send updated divs if/when tab is closed
    window.onunload = save_html_updates;
}

/**
 * Filter for YouTube mutations.
 * 
 * @memberof dom_observers
 */
function filter_youtube_mutations(mutations) {

    // Filter for mutations containing HTML nodes added in childList div
    mutations.forEach(function(mutation) {
        if ( 
            mutation.type === 'childList' && 
            mutation.target.tagName === 'DIV' &&
            mutation.addedNodes.length > 0
        ) {
            // Filter for nodes with YouTube item tags
            mutation.addedNodes.forEach(function(node) {
                if ( 
                    node.tagName === 'YTD-RICH-ITEM-RENDERER' || // Homepage
                    node.tagName === 'YTD-VIDEO-RENDERER'        // Search
                ) {
                    if (DEBUG.mutations) {
                        log_console('New YouTube videos div')
                        log_console(mutation)
                    }
                    // Add div HTML to save list 
                    HTML_UPDATES.push(node.outerHTML)
                }
            })
        }
    });
}
