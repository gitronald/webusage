/**
 * @file Content Script - Activity API.
 */


/**
 * Functions for parsing displayed DOM.
 * @namespace dom_parsers
 */

/**
 * Save a filtered list of links and ids in the DOM
 * 
 * @param {Object} data Information about this tab
 * @param {function} sendResponse A background reply function
 * 
 * @memberof dom_parsers
 */
function extract_links_and_ids(data) {
    
    // Extract all <a> link href
    var all_links = extract_all_links(document) 

    // Filter links with string matching 
    var twitter_links = filter_links(all_links, 'twitter.com');
    var youtube_links = filter_links(all_links, 'youtube.com');

    // Combine links
    data['links'].concat(twitter_links, youtube_links)

    // Extract ids from embedded twitter components
    data['tweet_ids'] = extract_embedded_tweet_ids(document)
    
    // Extract embedded YouTube videos
    data['youtube_iframes'] = extract_youtube_embeds(document)

    // Get timestamp and send to background
    data['timestamp'] = isostamp();

    // Send tab data to background
    return new Promise(function(resolve){ return resolve(data) });
}


/**
 * Extract all links from a web page.
 * 
 * @param {Object} document The web page object
 * 
 * @memberof dom_parsers
 */
function extract_all_links(doc) {
    var elements = Array.from(doc.getElementsByTagName("a"));
    return extract_by_key(elements, 'href')
}


/**
 * Extract ids for embedded tweets
 * 
 * @param {Object} doc The current DOM
 * 
 * @memberof dom_parsers
 */
function extract_embedded_tweet_ids(doc) {
    
    // Initialize return data
    var tweet_ids = [];

    // Parse Twitter elements
    var twitter_widgets = doc.getElementsByTagName('twitter-widget');
    twitter_widgets = Array.from(twitter_widgets);

    // Extract all Twitter IDs
    if (twitter_widgets.length > 0) {
        twitter_widgets.forEach(function(widget) {
            tweet_id = widget.getAttribute('data-tweet-id')
            log_console('Found embedded tweet: ' + tweet_id);
            tweet_ids.push(tweet_id)
        })
    }
    
    return tweet_ids
}

/**
 * Extract youtube embedded videos from iframes with matching url
 * 
 * @param {Object} doc The current DOM
 * 
 * @memberof dom_parsers
 */
function extract_youtube_embeds(doc) {

    // Parse YT iframes
    var iframes = get_iframes(doc, ['youtube']);

    // Extract URLs
    var youtube_embed_urls = extract_by_key(iframes, 'src');

    return youtube_embed_urls
}


// Tab Activated Listener ------------------------------------------------------

browser.runtime.onMessage.addListener(tab_activated_content_listener);

/**
 * Listen for messages from activity API and return tab info
 * 
 * @memberof activity
 */
function tab_activated_content_listener(msg, sender) {

    if (
        msg.to === 'content' &&
        msg.from === "activity" &&
        msg.subject === 'tab_activated'
    ) {
        log_console(msg)
        return handle_activated_message(msg);

    }
}

// Handler for activated messages
function handle_activated_message(msg) {
    // Get tab info
    var TAB_DATA = msg.tab_info;
    
    // Add URL to tab info
    TAB_DATA.url = document.URL;

    // Send response to background
    var activated_response = {
        to: "background",
        from: "content",
        subject: "tab_loading_confirmed",
        tab_info: TAB_DATA
    }

    // Send tab data to background
    return new Promise(function(resolve){ return resolve(activated_response) });
}

// Tab Updated Listener --------------------------------------------------------

browser.runtime.onMessage.addListener(tab_updated_content_listener);

/**
 * Listen for messages from Activity API
 * 
 * @memberof activity
 */
function tab_updated_content_listener(msg, sender) {

    if (
        msg.to === 'content' &&
        (msg.from === "activity" || msg.from === "survey_search") &&
        msg.subject === "tab_loading"
    ) {
        return handle_loading_msg(msg)

    } else if (
        msg.to === 'content' &&
        msg.from === "activity" &&
        msg.subject === "tab_loaded"
    ) {
        log_console(msg)

        // Set API params
        var params = msg.api_params;
        var domains = params.domains;  // domains to filter for full html
        var html_updates = params.html_updates;
        
        // Delete incognito - all updated tab messages are in normal windows
        delete msg.tab_info.incognito

        // Store tab meta data
        TAB_DATA = msg.tab_info;

        // Store tab URL and HTML
        TAB_DATA.url = document.URL;
        TAB_DATA.html = "";

        // Store tab links and ids
        TAB_DATA.links = [];
        TAB_DATA.tweet_ids = [];
        TAB_DATA.youtube_iframes = [];

        // If domain is a match, capture full html else only hyperlinks
        TAB_DATA.type = has_match(TAB_DATA.url, domains) ? 'html' : 'links';
        log_print('tab data:', TAB_DATA);
    
        if (TAB_DATA.type === 'html') {
            
            // Copy the entire DOM
            TAB_DATA['html'] = document.all[0].outerHTML
            
            // Set HTML update MutationObservers
            if (html_updates) {
                add_html_observer();
            }

            // Extract all links and IDs
            return extract_links_and_ids(TAB_DATA)
            

        } else if (TAB_DATA.type === 'links') {

            // Extract all links and IDs
            return extract_links_and_ids(TAB_DATA)
        }
    }

}

// Process loading message sent from Activity
function handle_loading_msg(msg) {

    log_console(msg)

    // Get tab info
    var TAB_DATA = msg.tab_info;
    
    // Add URL to tab info
    TAB_DATA.url = document.URL;

    // Save existing mutations
    if (msg.hasOwnProperty("save_mutations")) {
        if (msg.save_mutations) {
            // Save existing updates
            if (HTML_UPDATES.length > 0) {
                save_html_updates()
            }
            
            // Clear previous observer variables
            HTML_OBSERVER.disconnect()
            clearInterval(HTML_UPDATE_INTERVAL_ID)
        }
    }
    
    // Send confirmation that content injected on load
    var injected_msg = {
        to: "background",
        from: "content",
        subject: "tab_loading_confirmed",
        tab_info: TAB_DATA
    }
    return new Promise(function(resolve){ return resolve(injected_msg) });
}


// -----------------------------------------------------------------------------

/**
 * Functions for passively monitoring browser windows and tabs.
 * @namespace dom_observers
 */

 /**
 * Add DOM observer based on URL
 * 
 * @memberof dom_observers
 */
function add_html_observer() {
    if (is_match(TAB_DATA.url, 'news.google.com')) {
        add_google_news_observer();
    } else if (is_match(TAB_DATA.url, 'twitter.com/home')) {
        add_twitter_observer();
    } else if (is_match(TAB_DATA.url, 'youtube.com')) {
        add_youtube_observer();
    }
}

/**
 * Check and save if number of HTML updates meets length threshold.
 * 
 * @memberof dom_observers
 */
function check_for_html_updates() {
    // If update size exceeds ~750KB - send data and clear
    var num_updates = HTML_UPDATES.length;
    log_console('Checking updates | ' + TAB_DATA.url + ' | ' + num_updates);
    
    if (num_updates > HTML_UPDATE_SIZE_THRESHOLD) { 
        log_console('Save size threshold met');
        save_html_updates();
    }
}

/**
 * Send the updated HTML divs to the background script.
 * 
 * @memberof dom_observers
 */
function save_html_updates() {
    log_console('Saving HTML updates')
    
    if (HTML_UPDATES.length > 0) {
        log_console('Found HTML updates: ' + HTML_UPDATES.length)

        // Get current tab data
        var data = Object.assign({}, TAB_DATA);
        delete data.incognito // Remove incognito var, filtered earlier.

        // Add latest HTML updates
        data['type'] = 'mutation';
        data['html'] = HTML_UPDATES;

        // Save HTML updates
        browser.runtime.sendMessage({
            to: 'activity',
            from: 'content',
            subject: 'tab_mutation',
            data: data
        })

        // Clear HTML updates
        HTML_UPDATES = [];
        log_console('HTML updates reset');
    }
}
