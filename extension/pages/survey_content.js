var OLD_END_DATE = "December 31, 2020";
var NEW_END_DATE = "July 1, 2021";

var welcome = {
    name: "welcome",
    elements: [
        {
            type: "html",
            name: "welcome",
            html: "Welcome to the study, thank you for participating."
        }
    ]
};

var welcome_login = {
    name: "welcome",
    elements: [
        {
            type: "html",
            name: "welcome",
            html: "Please login to the services as part of the study you enrolled in."
        }
    ]
};

var welcome_reconsent = {
    name: "welcome",
    elements: [
        {
            type: "html",
            name: "welcome",
            html: "Thank you for your participation in the Web Usage study. This study was originally scheduled to complete on " + OLD_END_DATE + ". We would like to invite you to remain a participant in the Web Usage study until " + NEW_END_DATE + ". You will be remunerated for your participation at the same rate until the new end date. If you consent to participate in this study until the new end date then click below to continue. If you do not wish to remain in the study then you may close this tab now and the extension will automatically uninstall itself."
        }
    ]
};

var extension_summary = `
    <br><br>
    This extension implements a user study being conducted by researchers at Northeastern University, Dartmouth, Princeton, University of Exeter, and Rutgers. If you choose to participate, this browser extension will  confidentially collect four types of data from your browser:
    <br>
    <ol>
    <li>
        Metadata for web browsing (e.g. URL visited with time of visit), exposure to embedded URLs on websites (e.g. YouTube videos), and interactions with websites (e.g. clicks and video viewing time). This data is collected until the study is completed.
    </li>
    <li> 
        Copies of the HTML seen on specific sites: Google Search, Google News, YouTube, Facebook Newsfeed, and Twitter Feed. We remove all identifying information before it leaves the browser. This confidential data is collected until the study is completed.
    </li> 
    <li> 
        Browsing history, Google and YouTube account histories (e.g. searches, comments, clicks), and online advertising preferences (Google, Bluekai, Facebook). This data is initially collected for the year prior to the installation of our browser extension, and we then check these sources once every two weeks to collect updates until the study is completed.
    </li> 
    <li> 
        Snapshots of selected URLs from your browser. For each URL, the extension saves a copy of the HTML that renders, effectively capturing what you would have seen had you visited that website yourself. Once a week we conduct searches on Google Search, Google News, YouTube, and Twitter, and collect the current frontpage of Google News, YouTube, and Twitter. These web page visits will occur in the background and will not affect the normal functioning of your browser. There is a theoretical risk of “profile pollution” – that this extension will impact your online profiles, i.e., “pollute” them with actions that you did not take. To mitigate this risk, the extension will only visit content that is benign and will only execute searches for general terms. Our previous work has found that historical information of this kind has minimal impact on online services.
    </li> 
    </ol>

    Additionally, if you choose to participate, you will be asked to take a survey in which we ask you several questions about your demographics, web usage, and media preferences. These data, as well as those mentioned above, will be used to analyze the correlations between your online behavior and your interest profiles.
    <br><br>
`

var study_end = `
    After the study is complete on `+NEW_END_DATE+` the extension will uninstall itself and all data collection will cease. All data collected will be kept strictly confidential and used for research purposes only. We will not share your responses with anyone who is not involved in this research.
    <br><br>
`
var reconsent_end = `
    After the study is complete on `+NEW_END_DATE+` the extension will uninstall itself and all data collection will cease. All data collected will be kept strictly confidential and used for research purposes only. We will not share your responses with anyone who is not involved in this research.
    <br><br>
`

var conditions_and_contact = `
    You must be at least 18 years old to take part in this study. The decision to participate in this research project is voluntary. You do not have to participate and you can refuse to participate. Even if you begin our experiment, you can stop at any time. You may request that we delete all data collected from your web browser at any time.
    <br><br>

    We have minimized the risks. We are collecting basic demographic information, information about your internet habits, and copies of web pages that you visit. To the greatest extent possible, information that identifies you will be removed from all collected web data.
    <br><br>

    Your role in this study is confidential. However, because of the nature of electronic systems, it is possible, though unlikely, that respondents could be identified by some electronic record associated with the response. Neither the researchers nor anyone involved with this study will be collecting those data. Any reports or publications based on this research will use only aggregate data and will not identify you or any individual as being affiliated with this project.
    <br><br>

    If you have any questions about this research project, you may contact Professor Christo Wilson at <a href="mailto:cbw@ccs.neu.edu">cbw@ccs.neu.edu</a> or (617) 373-8802. If you have any questions about your rights as a research participant, you may contact Nan Regina, director for the office of Human Subjects Research Protection at <a href="mailto:n.regina@neu.edu">n.regina@neu.edu</a> or (617) 373-4588.
    <br><br>

    By checking the "I agree" box below, you agree that you have read and understand the information about and voluntarily agree to participate in the survey.
    <br><br>
`

var informed_consent = {
    name: "informed_consent",
    elements: [
        {
            type: "html",
            name: "consentText",
            html: "Welcome to the study!" + 
                extension_summary + 
                study_end + 
                conditions_and_contact
        },
        {
            type: "radiogroup",
            name: "consent",
            title: "Do you consent to participate in this research study?",
            isRequired: true,
            choices: [
                {text: "I Agree", value: "Yes"}, 
                {text: "I do not agree", value: "No"}
            ],
            colCount: 2
        },
        {
            type: "html",
            name: "earlyByeMessage",
            html: "</br><b> Thank you! You may un-install the extension. </b>",
            visible: false,
            visibleIf: "{consent}=='No'"
        }
    ]
};

var informed_reconsent = {
    name: "informed_reconsent",
    elements: [
        {
            type: "html",
            name: "consentText",
            html: "Welcome to the study!" + 
                extension_summary + 
                reconsent_end + 
                conditions_and_contact
        },
        {
            type: "radiogroup",
            name: "consent",
            title: "Do you consent to participate in this research study?",
            isRequired: true,
            choices: [
                {text: "I Agree", value: "Yes"}, 
                {text: "I do not agree", value: "No"}
            ],
            colCount: 2
        },
        {
            type: "html",
            name: "earlyByeMessage",
            html: "</br><b> Thank you! You may close this tab and the extension will automatically uninstall itself on " + NEW_END_DATE + ". </b>",
            visible: false,
            visibleIf: "{consent}=='No'"
        }
    ]
};

var allow_incognito = {
    name: "allow_incognito",
    elements: [
        {
            type: "html",
            name: "incognito_information",
            html: "In order for us to periodically take personalized and non-personalized snapshots of selected URLs from your browser, we need you to enable our extension to work in Incognito mode. We will not record your browsing history when you are using Incognito mode, we will only record data from Incognito windows that are automatically created by our extension.<br><br>"
        },
        {
            type: "html",
            name: "incognito_instructions",
            html: "",
            visible: false
        },
        {
            type: "html",
            name: "incognito_success",
            html: "<b>You have enabled Incognito mode!<br>Please click Next to continue.</b><br><br>",
            visible: false
        },
        {
            type: "radiogroup",
            name: "incognito_question",
            title: "Have you enabled Incognito mode?",
            isRequired: true,
            choices: [
                {text: "Yes", value: "Yes"},
                {text: "No", value: "No"}
            ],
            colCount: 2,
            visible: false,
            validators: [{type: "incognitovalidator"}]
        }
    ]
}

var allow_incognito_chrome = `
    To enable the snapshots in incognito mode:
    <ol>
        <li> 
            Open a new tab and type or copy and paste: 
            <span class="link-text">chrome://extensions</span> 
            into the url bar to see your extensions.
        </li>
        <li> 
            Find <b>Notheastern University Web Usage Study</b> and click on "Details."
            <br>
            <img src="imgs/view_extension_details.png" width=350px alt="View extension details">
        </li>
        <li> 
            Find the "Allow in incognito" option and turn it on by clicking the switch.
            <br>
            <img src="imgs/allow_incognito_mode.png" width=600px alt="Allow Incognito mode">
        </li>
    </ol>
`


var allow_incognito_firefox = `
    To enable the snapshots in incognito mode:
    <ol>
        <li> 
            Open a new tab and type or copy and paste: 
            <span class="link-text">about:addons</span>
            into the url bar to see your extensions.
        </li>
        <li> 
            Find <b>Notheastern University Web Usage Study</b> and click on it.
            <br>
            <img src="imgs/extension_listing-fx.png" width=450px alt="View extension details">
        </li>
        <li> 
        Find the "Run in Private Windows" option and turn it on by checking "Allow" as shown below.
            <br>
            <img src="imgs/view_extension_details-fx.png" width=450px alt="View extension details">
        </li>
    </ol>
`;


// Login to Google Account
var google_login = {
    name: "google_login",
    elements: [
        {
            type: "html",
            name: "google_information",
            title: "Google Login",
            html: "To proceed with our study you must have a Google account and be logged-in to it.<br><br>"
        },
        {
            type: "html",
            name: "google_link",
            html: "<a href=\"https://accounts.google.com\" class=\"button\" target=\"_blank\">Click here to login to Google</a>\n<br><br>",
            visible: false
        },
        {
            type: "radiogroup",
            name: "google_instructions",
            title: "Have you signed in to Google?",
            isRequired: true,
            choices: [
                {text: "Yes", value: "Yes"},
                {text: "No", value: "No"}
            ],
            colCount: 2,
            visible: false,
            validators: [{type: "loginvalidator"}]
        },
        {
            type: "html",
            name: "google_success",
            html: "<b>You are signed in to Google!<br>Please click Next to continue.</b><br><br>",
            visible: false
        }
    ]
};

var facebook_login = {
    name: "facebook_login",
    elements: [
        {
            type: "html",
            name: "FBInfo",
            title: "Facebook Login",
            html: "To gain a better understanding of what interests Facebook has inferred about you, we would like to request access to your Facebook account temporarily.\n\n"
        },
        {
            type: "radiogroup",
            name: "consent_fb",
            title: "Would you like to provide us with your Facebook interests?",
            isRequired: true,
            choices: [
                {text: "Yes", value: "Yes"},
                {text: "No", value: "No"}
            ],
            colCount: 2,
            visible: true
        },
        {
            type: "html",
            name: "facebook_success",
            html: "<br><br><b>You are signed in to Facebook!<br>Please click Next to continue.</b><br><br>",
            visible: false
        },
        {
            type: "html",
            name: "facebook_link",
            html: "<br><br>\n<a href=\"https://facebook.com\" class=\"button\" target=\"_blank\">Click here to login to Facebook</a>\n<br><br>",
            visible: false
        },
        {
            type: "radiogroup",
            name: "facebook_question",
            title: "Have you signed in to Facebook?",
            isRequired: true,
            choices: [
                {text: "Yes", value: "Yes"},
                {text: "No", value: "No"}
            ],
            colCount: 1,
            visible: false,
            validators: [{type: "loginvalidator"}]
        }
    ]
};

var onboarding_complete_yes = `
    You have successfully enrolled in this study. You may close this page but please keep the extension installed until ` + NEW_END_DATE + `.
    <br><br>
`;

var onboarding_complete_no = `
    Thank you! You may un-install the extension.
    <br><br>
`;

var logins_complete = `
    You have successfully logged in to the accounts required for this study. You may close this page but please keep the extension installed until `+ NEW_END_DATE + `.
    <br><br>
`;

var reconsent_complete_yes = `
    You have successfully reenrolled in this study. You may close this page but please keep the extension installed until `+ NEW_END_DATE +`.
    <br><br>
`;

var reconsent_complete_no = `
    Thank you! You may close this tab and the extension will automatically uninstall itself on ` + NEW_END_DATE + `. </b>
    <br><br>
`;