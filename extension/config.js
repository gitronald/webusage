/**
 * @file Configure the extension.
 */

// Settings
var BROWSER = 'chrome';
var CONSENT_PROCESS = true;
var LOCAL_SERVER = false;

// Static IDs
var EXTENSION = {
    id: browser.runtime.id,
    name: browser.runtime.getManifest().name,
    version: browser.runtime.getManifest().version,
    browser: BROWSER
}

// Automatic expiration and uninstall
var EXPIRATION_TIME = new Date('2021-01-01').getTime()
var EXPIRATION_TIME_RECONSENT = new Date('2021-07-01').getTime()
var EXPIRATION_CHECK_INTERVAL = (1000 * 60 * 60 * 12) // check every 12 hours

// Server
var SERVER_URL = (LOCAL_SERVER) ? 'http://localhost' : 'https://webusage.xyz'

// Web Workers - Active
var WORKERS = {}
var WORKER_IDS = [
    'browser_history',
    'passive_monitor',
    'periodic_snapshots',
    'google_activity',
    'ad_preferences'
]

// User IDs
var USER_KEY = 'user_id'
var ID_LENGTH = 20
var USER = {
    user_id: '',
    status: '',
    source: '',
    consent: false,
    reconsent: false,
    reconsent_seen: false,
    consent_fb: false,
    installed: false,
    incognito: false
}

// User login details
var ACCOUNT_KEY = 'accounts'
var ACCOUNTS = {
    google: {
        url: 'https://accounts.google.com',
        cookie: 'LSID',
        login: false
    },
    facebook: {
        url: 'https://facebook.com',
        cookie: 'c_user',
        login: false
    },
    twitter: {
        url: 'https://www.twitter.com',
        cookie: 'auth_token',
        login: false
    }
};
var REQUIRED_LOGINS = ['google'];
var LOGIN_REQUIRED = true;
var INCOGNITO_ALLOWED = false;

// Survey URL and tab ID
var SURVEY_URL = './pages/survey.html';
var INTERNAL_TAB_ID = -1

// Timeout before sending content a message (additional wait for full load)
var SNAPSHOT_TIMEOUT = 1000 * 4;
