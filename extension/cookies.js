/**
 * @file Track account login states with cookies.
 */


/**
 * Functions for handling cookies and login statuses.
 * @namespace account_login
 */

// Manual Update ---------------------------------------------------------------

/**
 * Get account login states from cookies and update in local storage
 * 
 * @memberof account_login
 */
function update_account_cookies() {
    log_console('Checking account login cookies')
    storage.get(ACCOUNT_KEY)
    .then(function(accounts) {
        // Iterate through stored accounts and update cookies
        Object.keys(accounts).forEach(function(name){
            update_account_cookie(accounts, name)
        })
    })
    .catch(function(error){
        log_work('cookies', 'error updating account cookies:\n'+error);
    });
}

/**
 * Update stored cookie details
 * 
 * @param {Object} accounts A dictionary of account names and details
 * @param {String} name The name of the account to look for
 * 
 * @memberof account_login
 */
function update_account_cookie(accounts, name) {

    log_work('cookies', 'checking | '+name);

    browser.cookies.get({
        url: accounts[name].url, 
        name: accounts[name].cookie
    })
    .then(function(cookie) {

        // If cookie exists set login status to true
        let login_status = cookie ? true : false;
        log_work('cookies', name + ' login - ' + login_status);
        accounts[name].login = login_status;

        // Store updated accounts data
        storage.set(ACCOUNT_KEY, accounts)
    });
}

// Listener Update -------------------------------------------------------------

/**
 * Listen to cookie changes for updates in account login status
 * 
 * @param {Object} info Object containing cookie change information 
 * 
 * @memberof account_login
 */
function account_cookie_listener(info) {

    // Retrieve account status
    check_account_cookies(info)
    .then(check_account_logins)
    .then(check_internal_tab_id)
    .then(browser.tabs.get)
    .then(function(tab) {
        // Send login status to survey
        return send_login_status(tab);
    })
    .catch(function(err) {
        if (err instanceof NoLoginRequiredError) {
            // Login not required, don't send login status msg
            if (DEBUG.cookies) log_work('cookies', 'no logins needed | '+ err);
        } else if (err instanceof InternalTabError) {
            // Handle no internal tab error, no stack trace
            if (DEBUG.cookies) log_work('cookies', 'no survey tab | '+ err);
        } else if (browser.runtime.lastError) {
            // Injection unsuccessful; invalid tab or permission err
            var err_msg = browser.runtime.lastError.message;
            if (DEBUG.cookies) log_work('cookies', 'invalid tab\n' + err_msg);
        } else {
            // Handle unknown errors, full stack trace
            log_work_err('cookies', 'error | ', err);
        }
    });
}


// Check a cookie's change info for matches and update account storage
function check_account_cookies(info) {

    if (DEBUG.cookies) log_work('cookies', 'updating accounts');

    return storage.get(ACCOUNT_KEY, false)
    .then(function(accounts) {
        var account_names = Object.keys(accounts);
        var cookie = info.cookie;

        // Iterate over accounts
        account_names.forEach(function(name) {

            // Filter for cookie change matches on account url and cookie name
            if (
                is_match(accounts[name].url, cookie.domain) && 
                cookie.name === accounts[name].cookie
            ) {

                // Update account login status
                let loggedin = info.removed ? false : true;
                accounts[name].login = loggedin;

                if (DEBUG.cookies) {
                    log_work('cookies', name+' login - '+loggedin, info);
                }
                
                // Store first true item and exit loop
                return storage.set(ACCOUNT_KEY, accounts, true)
            }
        });
    });
}


// Check if all accounts logged in
function check_account_logins() {
    return storage.get(ACCOUNT_KEY, false)
        .then(function(accounts) {
            var login_required = any_false(accounts, REQUIRED_LOGINS, 'login');
            if (login_required) {
                return accounts
            } else {
                throw new NoLoginRequiredError('no login required')
            }
        });
}

// Check if internal tab already exists, 
function check_internal_tab_id() {
    if (INTERNAL_TAB_ID > 0) { 
        return INTERNAL_TAB_ID
    } else {
        throw new InternalTabError('tab does not exist');
    }
}


// Error class for ignoring incognito tabs
class InternalTabError extends Error {
    constructor(message) {
      super(message);
      this.name = 'InternalTabError';
    }
}

// Error class for ignoring cookie changes if all logins set
class NoLoginRequiredError extends Error {
    constructor(message) {
      super(message);
      this.name = 'NoLoginRequiredError';
    }
}
