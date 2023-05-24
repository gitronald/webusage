/**
 * @file Extension onboarding survey for informed consent and installation.
 */

// Set Debug
var DEBUGGER = true; 

var survey;
var SURVEY_NAME ='';

// Global Variables
var LOGIN_GOOGLE = false;
var LOGIN_FB = false;
var CONSENT_FB = false;
var INCOGNITO_ALLOWED = false;
var BROWSER = '';

// Storage Variables
var STORAGE_KEY = "surveyjs_state";
var STATUS_STR = "";
var END_MESSAGE = "";
var END_MESSAGE_YES = "";
var END_MESSAGE_NO = "";

/* Logging */
function jsonify(dict, rep, space) { return JSON.stringify(dict, rep, space) }
function jsonify_format(dict) { return jsonify(dict, null, 2) }
function log_json(dict) { log_console(jsonify(dict, null, 2)) }
function log_console(print_msg) {
    if (DEBUGGER) {
        console.log(print_msg);
    }
}
function log_print(obj1, obj2={}) {
    var output = obj1
    output += '\n' + jsonify_format(obj2);
    log_console(output)
}
function is_defined(obj) { return typeof obj != 'undefined'}


// Survey Content --------------------------------------------------------------

var FACEBOOK_LOGIN = false;

// Survey Settings
var survey_json = {
    title: "Web Usage Study",
    showProgressBar: "bottom",
    goNextPageAutomatic: false,
    showNavigationButtons: true, 
    showQuestionNumbers: 'off',
    triggers: [ 
        // Send user to survey completion if consent == No
        {
            "type": "complete",
            "operator": "equal",
            "value": "No",
            "name": "consent"
        }
    ]
}



// Survey style customization
Survey.Survey.cssType = "bootstrap";
Survey.defaultBootstrapCss.navigationButton = "btn btn-blue";
Survey.defaultBootstrapCss.progressBar = "progress-bar progress-bar-custom";

// Listeners -------------------------------------------------------------------

// Listen for messages from background
chrome.runtime.onMessage.addListener(survey_start_listener);

function survey_start_listener(msg, sender, sendResponse) {

    if (msg.subject === "survey_start") {

        log_print("Survey startup message received:", msg);

        INCOGNITO_ALLOWED = msg.incognito_allowed
        LOGIN_GOOGLE = msg.google_login;
        LOGIN_FB = msg.facebook_login;
        CONSENT_FB = msg.consent_fb;
        BROWSER = msg.browser;
        SURVEY_NAME = msg.survey_name;

        // Set browser specific instructions
        if (BROWSER === 'chrome') {
            allow_incognito.elements[1].html = allow_incognito_chrome;
        } else if (BROWSER === 'firefox') {
            allow_incognito.elements[1].html = allow_incognito_firefox;
        }

        // Add survey content (from survey_name.js)
        if (SURVEY_NAME === 'onboarding') {
            survey_json.pages = [];
            survey_json.pages.push(welcome);
            survey_json.pages.push(informed_consent);
            survey_json.pages.push(allow_incognito);
            survey_json.pages.push(google_login);
            END_MESSAGE_YES = onboarding_complete_yes;
            END_MESSAGE_NO = onboarding_complete_no;

        } else if (SURVEY_NAME === 'account_login') {
            clear_state() // clear previous survey state
            survey_json.pages = [];
            survey_json.pages.push(welcome_login);
            survey_json.pages.push(google_login);
            END_MESSAGE_YES = END_MESSAGE_NO = logins_complete;

        } else if (SURVEY_NAME === 'reconsent') {
            clear_state() // clear previous survey state
            survey_json.pages = [];
            survey_json.pages.push(welcome_reconsent);
            survey_json.pages.push(informed_reconsent);
            END_MESSAGE_YES = reconsent_complete_yes;
            END_MESSAGE_NO = reconsent_complete_no;
            
        }

        // Add optional facebook login survey component
        if (FACEBOOK_LOGIN) {
            survey_json.pages.push(facebook_login);
        }

        // Build Survey Model
        survey = new Survey.Model(survey_json);


        // Load the initial state and activate survey listeners
        load_state(survey);
        survey.onValueChanged.add(save_on_value_change);
        survey.onCurrentPageChanged.add(save_on_page_change);
        survey.onComplete.add(save_on_complete);

        // SurveyJS - jQuery render survey with above options
        $("#surveyElement").Survey({model: survey});

        // Update component visibility and render
        proceed_survey();
    }
}

// Survey value changed - save state and update visibility of FB sections
function save_on_value_change(sender, options) {
    var completed = false
    save_state(survey, options, completed);

    // Filter for fb consent answer
    if (options.name == "consent_fb") {
        if (options.value == "Yes") {
            // If yes, proceed survey and show fb components
            CONSENT_FB = true;
            proceed_survey();
        } else if (options.value == "No") {
            // If no, hide all fb components
            change_visibility_list([
                ['facebook_success', false],
                ['facebook_question', false],
                ['facebook_link', false]
            ], false);
        }
    }
}

// Save when survey page changed
function save_on_page_change(survey, options) {
    var completed = false
    save_state(survey, options, completed);
}

// Survey completed - save state, display end text, and send data to background
function save_on_complete(survey, options) {
            
    log_console('Survey completed')
    var completed = true
    save_state(survey, options, completed);
    
    // Display end message
    if (
        survey.data['consent'] == 'No' &&
        ((SURVEY_NAME == 'onboarding') || (SURVEY_NAME == 'reconsent'))
    ) {
        document.querySelector('#surveyResult').innerHTML = END_MESSAGE_NO;
    } else {
        document.querySelector('#surveyResult').innerHTML = END_MESSAGE_YES;
    }

    // Send message to background
    chrome.runtime.sendMessage({
        to: 'background',
        from: SURVEY_NAME,
        subject: 'complete',
        data: survey.data
    });
}


// Listen for messages from background
chrome.runtime.onMessage.addListener(login_status_listener);

/**
 * Receive login status messages.
 * 
 * @param {Object} msg Message from background
 * @param {Object} sender Details about message sender
 * @param {function(object):void} sendResponse Send message back to sender
 * 
 * @memberof survey
 */
function login_status_listener(msg, sender, sendResponse) {

    if (msg.subject === "login_status") {

        log_console("Message received for login status");
        log_json(msg);

        INCOGNITO_ALLOWED = msg.incognito_allowed
        LOGIN_GOOGLE = msg.google_login;
        LOGIN_FB = msg.facebook_login;
        CONSENT_FB = msg.consent_fb;
        BROWSER = msg.browser;

        proceed_survey();
    }

}

// Survey Manipulation ---------------------------------------------------------

/**
 * Change the visibility of a specific element.
 * 
 * @param {Object} elemName 
 * @param {boolean} visibilityStatus 
 * 
 * @memberof survey
 */
function change_visibility(elemName, visibilityStatus) {
    var elem = survey.getQuestionByName(elemName);
    if (elem != null) { // Ignore if question doesn't exist
        elem.visible = visibilityStatus;
    };
}


function change_visibility_list(elem_list, reverse_if) {
    // Show instructions, question, and success message
    elem_list.forEach(function(elem) {
        
        // If incognito allowed; show opposite of defaults (only success msg)
        var elem_name = elem[0];
        var show_elem = (reverse_if) ? !elem[1] : elem[1];;
        change_visibility(elem_name, show_elem);
    });
}


/**
 * Modify the visibility of survey components as user logs in to services
 * 
 * @memberof survey
 */
function proceed_survey() {
    
    // Show instructions and question or success message
    var incognito_defaults = [
        ['incognito_instructions', true],
        ['incognito_question', true], 
        ['incognito_success', false]
    ];
    change_visibility_list(incognito_defaults, INCOGNITO_ALLOWED);

    // Show instructions and question or success message
    var google_defaults = [
        ['google_instructions', true],
        ['google_link', true], 
        ['google_success', false]
    ];
    change_visibility_list(google_defaults, LOGIN_GOOGLE);

    // Show instructions and question or success message
    var facebook_defaults = [
        ['facebook_instructions', true],
        ['facebook_link', true], 
        ['facebook_success', false]
    ];
    change_visibility_list(facebook_defaults, LOGIN_FB);

    survey.render();
}

// Custom Input Validators -----------------------------------------------------


/**
 * Custom input validation.
 * 
 * Works by returning an error for all input - the logic being that it is only 
 * used on inputs that should disappear (therefore not raising an error) when 
 * the user takes some action, like logging into Google or Facebook.
 * 
 * @memberof survey
 */
var LoginValidator = (function (_super) {
    Survey.__extends(LoginValidator, _super);
    
    function LoginValidator() {
        _super.call(this);
    }
    
    LoginValidator.prototype.getType = function () { 
        return "loginvalidator"; 
    };

    LoginValidator.prototype.validate = function (value, name) {

        if (value === "Yes") { 
            // User says they've done it, but haven't
            return new Survey.ValidatorResult(null, 
                new Survey.CustomError(this.getErrorText("loginError"))
            );
        }
        if (value === "No") {
            // The User says no
            return new Survey.ValidatorResult(null, 
                new Survey.CustomError(this.getErrorText("refuseError"))
            );
        }
        
        //returns null if there is no any error.
        return null;
    };
    //the default error text. It shows if user do not set the 'text' property
    LoginValidator.prototype.getDefaultErrorText = function(name) {
        if (name === "loginError") {
            return "You haven't logged in yet, please click the link above and sign in before proceeding.";
        } 
        if (name === "refuseError") {
            return "Please sign in to proceed";
        } 
    }
    return LoginValidator;
})(Survey.SurveyValidator);


Survey.LoginValidator = LoginValidator;

// Add into survey Json metaData
Survey.JsonObject.metaData.addClass("loginvalidator", [], 
    function () { return new LoginValidator(name); }, 
    "surveyvalidator"
);

// Incognito Validator ---------------------------------------------------------


/**
 * Custom input validation.
 * 
 * Works by returning an error for all input - the logic being that it is only 
 * used on inputs that should disappear (therefore not raising an error) when 
 * the user takes some action, like logging into Google or Facebook.
 * 
 * @memberof survey
 */
var IncognitoValidator = (function (_super) {
    Survey.__extends(IncognitoValidator, _super);
    
    function IncognitoValidator() {
        _super.call(this);
    }
    
    IncognitoValidator.prototype.getType = function () { 
        return "incognitovalidator"; 
    };

    IncognitoValidator.prototype.validate = function (value, name) {

        if (value === "Yes") { 
            // User says they've done it, but haven't
            return new Survey.ValidatorResult(null, 
                new Survey.CustomError(this.getErrorText("incognitoError"))
            );
        }
        if (value === "No") {
            // The User says no
            return new Survey.ValidatorResult(null, 
                new Survey.CustomError(this.getErrorText("refuseError"))
            );
        }
        
        //returns null if there is no any error.
        return null;
    };
    //the default error text. It shows if user do not set the 'text' property
    IncognitoValidator.prototype.getDefaultErrorText = function(name) {
        if (name === "incognitoError") {
            return "You haven't enabled incognito yet, please follow the instructions above before proceeding.";
        } 
        if (name === "refuseError") {
            return "Please enable incognito mode to proceed";
        } 
    }
    return IncognitoValidator;
})(Survey.SurveyValidator);


Survey.IncognitoValidator = IncognitoValidator;

// Add into survey Json metaData
Survey.JsonObject.metaData.addClass("incognitovalidator", [], 
    function () { return new IncognitoValidator(name); }, 
    "surveyvalidator"
);

// Survey Model and Functions --------------------------------------------------

/**
 * Load last saved survey state if it exists.
 * 
 * @param {Survey.Model} survey The surveyjs model
 * 
 * @memberof survey
 */
function load_state(survey) {   
    log_console('Loading survey status')

    var surveyStatus = {};
    var STATUS_STR = window.localStorage.getItem(STORAGE_KEY) || "";

    if (STATUS_STR) {
        // Parse the survey status if it exists
        surveyStatus = JSON.parse(STATUS_STR);
        log_json(surveyStatus)
        
        if (surveyStatus.completed) {
            // Survey is already done - user reloaded URL, send to finish
            survey.completeLastPage()
            document.querySelector('#surveyResult').innerHTML = END_MESSAGE;
        } else {
            // Use loaded values to set current survey state
            survey.currentPageNo = surveyStatus.currentPageNo;
            survey.data = surveyStatus.data;
        }
    }
}

/**
 * Save the current state (page number and data input) of the survey.
 * 
 * @param {Survey.Model} survey The surveyjs model
 * @param {Object} options The details passed to listener when a value changes
 * @param {Boolean} completed Whether or not the survey has been completed
 * 
 * @memberof survey
 */
function save_state(survey, options, completed) {
    log_console('Saving survey status')
    var surveyStatus = { 
        completed: completed,
        currentPageNo: survey.currentPageNo, 
        data: survey.data 
    }
    log_json(surveyStatus);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(surveyStatus));
}

function clear_state() {
    var surveyStatus = { 
        completed: false,
        currentPageNo: 0, 
        data: {}
    }
    log_json(surveyStatus);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(surveyStatus))
}

// Survey listeners ------------------------------------------------------------

