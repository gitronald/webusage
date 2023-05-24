/**
 * @file Background script that messages workers, content, and server.
 */


// Define APIs available
var API_DICT = {
    'browser_history': api_browser_history,
    'activity': api_activity,
    'periodic_snapshots': api_periodic_snapshots,
    'website_history': api_website_history
}

// Startup process -------------------------------------------------------------

/**
 * Functions for handling browser startup and onboarding.
 * @namespace startup
 */

extension_startup()

function extension_startup() {
    log_print('Loading Extension:', EXTENSION)
    log_print('Active Workers:', WORKER_IDS)

    // Get incognito allowed status
    browser.extension.isAllowedIncognitoAccess()
    .then(function(result) { 
        log_console('Checking incognito: ' + result)
        INCOGNITO_ALLOWED = is_defined(result) ? result : false;
    });

    // Load user status
    load_user(USER_KEY)
    .then(function(user) {

        // Check expiration date, auto uninstall if passed
        check_expiration()

        // Load accounts status
        load_accounts(ACCOUNT_KEY)
        .then(function(accounts) {
            
            // Persistently listen for changes to account cookies
            browser.cookies.onChanged.addListener(account_cookie_listener);
            
            // Modify consent process for testing
            if (CONSENT_PROCESS) {

                if (user.installed) {
                    log_console('Extension installed');
                    check_login_requirements();
                    
                } else {
                    log_console('Extension not installed');
                    launch_survey('onboarding');
                }

            } else {
                log_console('Skipping onboarding');
                save_user();
                initialize_workers();
            }
        })
    })
    .catch(function(error) {
        log_err('Error loading extension', error)
    })

}

/**
 * Classify user source based on ID
 * 
 * @param {string} user_id A unique user ID
 * 
 * @memberof startup
 */
function get_user_source(user_id) {
    var uid = user.user_id;
    var id_hyphens = uid.split('-');
    if (id_hyphens.length == 5) {
        return 'qualtrics'
    } else if (uid.length == 14) {
        return 'yougov'
    } else if (uid.startsWith("test-")) {
        return 'test'
    } else {
        return 'unknown'
    }
}


/**
 * Load user status from local storage or initialize.
 * 
 * @param key The storage.local key to use
 * 
 * @memberof startup
 */
function load_user(key) {

    var data = storage.get(key)
    .then(function(user) {

        if (is_undefined(user)) {

            // Create user ID and status
            log_console('Initializing user');
            USER.status = 'init'
            USER.user_id = 'test-' + make_id(ID_LENGTH);
            USER.source = 'test'

            // Don't show new users reconsent form
            USER.reconsent = true
            USER.reconsent_seen = true

            // Store user details
            storage.set(USER_KEY, USER).then(function() {
                // Find user ID in survey tab else leave as random ID
                find_survey_tab();
            })

    
        } else {
            // Found stored values
            log_print('Found User:', user);
                  
            // Check if user source is set - qualtrics reconsent
            if (!('source' in user) || user.source === '') {
                user.source = get_user_source(user.user_id)
                storage.set(USER_KEY, user)
            }

            // Overwrite global with stored values
            USER = user;
        }
        
        return USER
    })
    .catch(function(error) {
        log_err('Error on load user', error)
    });

    return data
}


/**
 * Load accounts status from local storage or initialize.
 * 
 * @param key The storage.local key to use
 * 
 * @memberof startup
 */
function load_accounts(key) {

    var data = storage.get(key)
    .then(function(accounts) {

        if (is_undefined(accounts)) {        
            // Initialize accounts status and cookies
            log_console('Initializing accounts');
            storage.set(ACCOUNT_KEY, ACCOUNTS);
    
        } else {
            // Get stored values
            log_print('Found Accounts:', accounts);
            ACCOUNTS = accounts;
        }
    
        update_account_cookies();
        return ACCOUNTS
    })
    .catch(function(error) {
        log_err('Error on load accounts', error)
    });
    return data
}


/**
 * Check that user is logged in to required accounts.
 * 
 * @memberof startup
 */
function check_login_requirements() {
   
    storage.get(ACCOUNT_KEY)
    .then(function(accounts) {
        return any_false(accounts, REQUIRED_LOGINS, 'login');
    })
    .then(function(login_required) {

        // If user from qualtrics and hasn't seen reconsent
        if (
            USER.source === 'qualtrics' && 
            !USER.reconsent && 
            !USER.reconsent_seen
        ) {
            log_console('Reconsent required');
            launch_survey('reconsent');

        // If user needs to log into a required account
        } else if (login_required) {
            // Launch account login process
            log_console('Account login required');
            launch_survey('account_login');

        } else {
            // Initialize the web workers
            log_console('Account logins set');
            initialize_workers();
        }
    })
    .catch(function(error) {
        log_err('Error checking logins', error)
    });
}

// Survey ----------------------------------------------------------------------

/**
 * Functions for launching and handling surveys.
 * @namespace survey
 */


/**
 * The installation process
 * 
 * @memberof survey
 */
function launch_survey(survey_name) {
    assert(is_defined(survey_name), 'Must provide internal survey URL');
    log_console('Launching survey: ' + survey_name);

    // Create new tab with URL
    browser.tabs.create({url: SURVEY_URL, active: true})
    .then(function(tab) {
        // Set tab id
        INTERNAL_TAB_ID = tab.id;

        // Listen for new tab to load
        browser.tabs.onUpdated.addListener(function lstnr(tabId, info, tab) {   
            if (
                tabId === INTERNAL_TAB_ID && 
                info.status === 'complete'
            ) {
                // Send account login status
                send_survey_startup_message(tab, survey_name);

                if (survey_name === 'reconsent') {
                    // Document that the user saw the reconsent form
                    USER.reconsent_seen = true;
                    storage.set(USER_KEY, USER);
                }
        
                // Add listener for survey completion
                browser.runtime.onMessage.addListener(survey_listener);
        
                // Remove this listener
                browser.tabs.onUpdated.removeListener(lstnr);
            }
        });
    })
}



/**
 * Send message to survey tab from background with login statuses
 * 
 * @memberof survey
 */
function send_survey_startup_message(tab, survey_name) {
    
    // Get login from storage
    storage.get(ACCOUNT_KEY)
    .then(function(accounts) {
        // Create message
        var msg = {
            to: 'survey',
            from: 'background',
            subject: 'survey_start',
            incognito_allowed: INCOGNITO_ALLOWED,
            google_login: accounts.google.login,
            facebook_login: accounts.facebook.login,
            consent_fb: false,
            browser: BROWSER,
            survey_name: survey_name
            
        }
        return msg
    })
    .then(function(msg){
        // Send message to survey tab
        send_tab_message(tab, msg);
    })
    .catch(function(error) {
        log_print('Failed to send login status', error);
    })
}



/**
 * Send message to survey tab from background with login statuses
 * 
 * @memberof survey
 */
function send_login_status(tab) {
    
    // Get login from storage
    storage.get(ACCOUNT_KEY)
    .then(function(accounts) {

        var msg = {
            to: 'survey',
            from: 'background',
            subject: 'login_status',
            incognito_allowed: INCOGNITO_ALLOWED,
            google_login: accounts.google.login,
            facebook_login: accounts.facebook.login,
            consent_fb: false,
            browser: BROWSER
        }

        // Send message to survey tab
        log_work('survey', 'sending login status to: ' + tab.id, msg)
        send_tab_message(tab, msg);
    })
    .catch(function(error) {
        log_print('Failed to send login status', error);
    })
}


/**
 * Handle messages from survey
 * 
 * @memberof survey
 */
function survey_listener(msg, sender, sendResponse) {
    
    // Filter "complete" messages from survey [onboarding]
    if (
        msg.to === 'background' &&
        msg.from === 'onboarding' &&
        msg.subject === 'complete'
    ) {
        log_console('Installation completed');
        log_json(msg)
        
        var survey_data = msg.data;

        // Update user with survey data
        USER.installed = true
        USER.consent = (survey_data['consent'] === 'Yes') ? true : false;
        USER.consent_fb = (survey_data['consent_fb'] === 'Yes') ? true : false;

        // Send user data to server
        save_user()

        // Set user data
        storage.set(USER_KEY, USER).then(function() {
            // Start up the workers
            initialize_workers();
        })

        // Remove listener
        browser.runtime.onMessage.removeListener(survey_listener)
    
    // Filter "complete" messages from survey [account_login]
    } else if (
        msg.to === 'background' &&
        msg.from === 'account_login' &&
        msg.subject === 'complete'
    ) {
            
        log_console('Required accounts are logged in');
        log_json(msg)

        var survey_data = msg.data;

        // Now that the logins are done, start up the workers
        initialize_workers();

        // TODO: Clear local storage to reset survey state, otherwise relogin 
        // starts at end of survey

        // Remove listener
        browser.tabs.onUpdated.removeListener(survey_listener);

    // Filter "complete" messages from survey [reconsent]
    } else if (
        msg.to === 'background' &&
        msg.from === 'reconsent' &&
        msg.subject === 'complete'
    ) {
            
        log_console('Reconsent process complete');
        log_json(msg)

        var survey_data = msg.data;

        // Update globals with survey data
        USER.reconsent = (survey_data['consent'] === 'Yes') ? true : false;

        // TODO: 
        // - register change in end date

        // Set user data
        storage.set(USER_KEY, USER).then(function() {
            // Start up the workers
            initialize_workers();
        })
        
        // Remove listener
        browser.tabs.onUpdated.removeListener(survey_listener);
    }

}



// Content Script --------------------------------------------------------------

/**
 * Functions for interacting with the content script
 * @namespace content
 */


/**
 * Send a message to a content script.
 * 
 * @param {Object} tab The tab to send the message to
 * @param {Message} msg The message to send to the tab
 * @param {Number} delay Milliseconds to wait before sending message
 * 
 * @memberof content
 * 
 */
function send_tab_message(tab, msg, delay=0) {
    
    // Define worker
    var wid = msg.from
    
    // Append tab details
    msg.tab_info = {
        wintab: [tab.windowId, tab.id].join('-'),
        lastwt: is_defined(ACTIVE.id) ? ACTIVE.id : '',
        incognito: tab.incognito
    }
    
    // Send message to content script in a tab
    return set_delay(delay).then(function() { 

        log_work(wid, 'sending msg to '+tab.id, msg);
        return browser.tabs.sendMessage(tab.id, msg).catch(function(err) { 
                if (browser.runtime.lastError) {
                    // Injection unsuccessful; invalid tab or permission err
                    var err = browser.runtime.lastError.message;
                    log_work(wid, 'runtime err\n' + err);
                }
            });
    })
}

// example: set_updated_delay(1000).then(function() { console.log('hi') })
function set_delay(delay_ms, v) {
    // Delay with promises
    return new Promise(function(resolve) { 
        setTimeout(resolve.bind(null, v), delay_ms)
    });
}

/**
 * Handle meta data messages from content
 * 
 * @memberof content
 */
function content_meta_data_listener(msg, sender, sendResponse) {
    if (
        msg.from === 'content' &&
        msg.subject === 'meta_data'
    ) {
        log_console(sender)
        // Send a message back to content script with its own window and tab IDs
        browser.tabs.sendMessage(sender.tab.id, {
            to: 'content',
            from: 'background',
            subject: 'meta_data',
            body: {
                win_id: sender.tab.windowId,
                tab_id: sender.tab.id,
                incognito: sender.tab.incognito
            }
        });
    }
}


browser.runtime.onMessage.addListener(content_meta_data_listener);

// Server ----------------------------------------------------------------------

/**
 * Functions for interacting with the server.
 * @namespace server
 */


/**
 * Send user data to server.
 * 
 * @param {Message} msg The {@link Message} to send
 * 
 * @memberof server
 */
function save_user() {
    log_console('Saving user data')

    // Set data to send
    out_data = {
        user_id: USER.user_id,
        browser: EXTENSION.browser,
        consent: USER.consent,
        consent_fb: USER.consent_fb,
        install_time: isostamp(),
        version: EXTENSION.version
    }

    // Send data to server
    fetch_post_json(SERVER_URL + '/save_user', out_data)
    .then(log_json)
    .catch(function(error) {
        log_console('Error saving user', error)
    })

}


/**
 * Send web data to server.
 * 
 * @param {Message} msg The {@link Message} to send
 * 
 * @memberof server
 */
function save_data(worker_id, data, api) {

    log_work(worker_id, 'saving data');
    
    // Add IDs and meta data
    var out_data = {
        user_id: USER.user_id,
        worker_id: worker_id,
        timestamp: isostamp(),
        version: EXTENSION.version,
        api: api,
        data: data
    }

    // Send data to server, return promise with server response
    return fetch_post_json(SERVER_URL + '/save_data', out_data)
        .catch(function(error) {
            log_work(worker_id, 'error saving data', error)
        })
}

// Uninstall -------------------------------------------------------------------

/**
 * Uninstall extension if expiration conditions are met.
 */
function check_expiration() {
    log_console('Checking expiration')
    // If user hasn't reconsented and deadline has passed, uninstall
    if (!USER.reconsent && timestamp() > EXPIRATION_TIME) {
        console.log('Uninstalling extension');
        browser.management.uninstallSelf();    
    // If user did reconsent and new deadline has passed, uninstall
    } else if (USER.reconsent && timestamp() > EXPIRATION_TIME_RECONSENT) {
        // Expire if reconsent and reconsent expiration time passed
        console.log('Expiring')
        browser.management.uninstallSelf();
    } else {
        console.log('Expiration date has not past')
    }
}

// Run immediately - moved to load_user because user data needs to load from local storage
// check_expiration();

// Set reoccuring expiration check at specified interval
setInterval(check_expiration, EXPIRATION_CHECK_INTERVAL);

// Find Survey Tab -------------------------------------------------------------

// Qualtrics example
// https://rutgers.ca1.qualtrics.com/jfe/form/SV_3WNOWhs670VN8oJ?return=1&gender=112&age=38&race=113&employments=114&houseHoldIncome=20000&educations=112&relationships=114&Children=112&states=13&zipcodes=30004&transaction_id=6k7dPxRH5VNnSTQzwGvFWv&psid=f25b890d-6ce1-21ca-17ef-266c19df9177&supplier_id=176

// YouGov Example
// https://g4-us.yougov.com/v1yPF9Xq3BG1k6

// Delay before sending message
var SEARCH_TAB_DELAY = 1000;

// Surveys to search for
var survey_list = [
    {
        id:'qualtrics',
        url:'https://rutgers.ca1.qualtrics.com',
        param: 'psid'
    },
    {
        id:'yougov',
        url:'https://g4-us.yougov.com',
        param:''
    }
];

// Search through existing tabs for survey
function find_survey_tab() {
    return browser.tabs.query({})
    .then(search_tab_urls)
    .catch(function(error) {
        log_err('error finding survey tab', error)
    });
}


// Send message to all tabs to check for survey url
function search_tab_urls(tabs) {
    for (let tab_idx = 0; tab_idx < tabs.length; tab_idx++) {
        const tab = tabs[tab_idx];
        log_console('Searching for survey tab ('+tab_idx+'/'+tabs.length+')');

        // Inject polyfill script
        browser.tabs.executeScript(tab.id, {
            file: "browser-polyfill.js",
            runAt: "document_start"
        })
        .then(function() {
            // Inject utils and activity content scripts
            browser.tabs.executeScript(tab.id, {
                file: "content/utils.js",
                runAt: "document_start"
            })
            browser.tabs.executeScript(tab.id, {
                file: "content/activity.js",
                runAt: "document_start"
            })
        })
        .then(function() {
            // Send tab a loading message after fixed delay (allow to load)
            send_tab_message(tab, {
                to: 'content',
                from: 'survey_search', 
                subject: 'tab_loading'
            }, SEARCH_TAB_DELAY)
            .then(filter_undefined_responses)
            .then(check_response_tab_url)
            .then(function(result){
                if (is_defined(result.user_id)) {
                    USER.user_id = result.user_id
                    USER.source = result.source
                    storage.set(USER_KEY, USER);
                }
            })
            .catch(function(err) {
                handle_tab_messaging_errors('survey_search', err)
            });
        })
        .catch(function(error) {
            log_console('error injecting ['+tab.id+']: ' + error.message)
        })

    }
}


// Check tab response for matching URL
function check_response_tab_url(response) {
    var url = response.tab_info.url;

    // Check if any open URL matches a known survey
    for (let survey_idx = 0; survey_idx < survey_list.length; survey_idx++) {
        const survey = survey_list[survey_idx];
        var result = {'source': survey.id}
        if (url.startsWith(survey.url)) {
            // Extract the necessary ID and save
            log_console('found url: ' + url)
            if (survey.id === 'qualtrics') {
                result.user_id = get_url_parameter(survey.param, url)
            } else if (survey.id === 'yougov') {
                result.user_id = url.split('.com/')[1]
            }
            
            // Return first match
            log_print('found new user:', result)
            return result
        }
    }
} 

// Extract a URL param by name
function get_url_parameter(param, url) {
    param = param.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + param + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}



// Popup -----------------------------------------------------------------------

/**
 * Handle messages from popup
 * 
 * @memberof popup
 */
function popup_message_listener(msg, sender, sendResponse) {
    
    if (
        msg.to === 'background' &&
        msg.from === 'popup'
    ) {
        log_console('Received message from popup');
        log_json(msg)
        
        if (msg.subject === 'api') {
            call_api(msg)
        }
        sendResponse('hey popup');

    }
}

browser.runtime.onMessage.addListener(popup_message_listener);
