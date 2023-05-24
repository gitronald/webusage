"""Save Extension Data
"""
from flask import render_template
from app.faq import bp


@bp.route('/faq', methods=['GET'])
@bp.route('/faq/', methods=['GET'])
def faq():
    # make_connection()
    return render_template('faq.html', title='FAQ', faq=faq_content)

faq_content = [
    {
        "title": "Basics",
        "contents": [
            {
                "question": "What is going on here?",
                "answer": "This webpage corresponds to a scientific study that is currently ongoing. In this study, we are recruiting participants to install an extension in their browser, as well as answer some survey questions. The browser extension collects a variety of data from participants' browsers related to where they go online and they content they see."
            },
            {
                "question": "What is the point of this research?",
                "answer": "We plan to use all of the data we collect from participants to get a better understanding of how people browse the web, how people actively seek information online (e.g., using search engines), how services personalize content for people using algorithms, and what kinds of content people actually read online. Even though the web has been widely available for 30 years, we know surprisingly little about how people use it."
            },
            {
                "question": "Who is conducting this research?",
                "answer": "This research is being conducted by an interdisciplinary group of academics at Northeastern University, Dartmouth University, Princeton University, University of Exeter, and Rutgers University. The team includes computer scientists, computational social scientists, and political scientists. Members of the team include: <ul><li><a href=\"https://cbw.sh/\">Christo Wilson</a> - Northeastern University</li><li><a href=\"https://www.lazerlab.net/\">David Lazer</a> - Northeastern University</li><li><a href=\"https://www.brendan-nyhan.com/\">Brendan Nyhan</a> - Dartmouth University</li><li><a href=\"https://andyguess.com/\">Andrew Guess</a> - Princeton University</li><li><a href=\"http://jasonreifler.com/\">Jason Reifler</a> - University of Exeter</li><li><a href=\"https://kateto.net/\">Katherine Ognyanova</a> - Rutgers University</li></ul>"
            },
            {
                "question": "When does this study end?",
                "answer": "This study ends on December 31, 2020, or on July 1, 2021, depending on how you joined this study and end date you consented to. During the study, we may ask if you wish to continue participating until an extended end date. When the end date you consented to is reached, we will stop collecting data and our browser extension will uninstall itself."
            },
            {
                "question": "Who is funding this research?",
                "answer": "This study is supported by the U.S. National Science Foundation (NSF), the Russel Sage Foundation, and the Anti-Defmation League. Any opinions, findings, and conclusions or recommendations expressed on this website are those of the authors and do not necessarily reflect the views of the funding agencies."
            },
            {
                "question": "Are you affiliated with any tech companies?",
                "answer": "In this study we will be examining tech platforms provided by Google, Facebook, Twitter, YouTube, and potentially other large companies. We are not affiliated with these companies, and they are not involved in this research in any way."
            }
        ]
    },
    {
        "title": "Info for Participants",
        "contents": [
            {
                "question": "Who is eligible to participate in this research?",
                "answer": "US residents who speak English and are 18 years of age or older are eligible to participate. You must be willing to answer our survey questions and install our browser extension to participate. Finally, you must have a Google account, and be signed-in to it for the duration of the study."
            },
            {
                "question": "Why do I need a Google account?",
                "answer": "One aspect of our study is that we are interested in how participants use Google services, like Google Search and YouTube. We rely on Google's account history tools (specifically, Web &amp; App Activity and YouTube History) to gather information on participants' usage of Google services, and this tool is only available to people who have a Google account."
            },
            {
                "question": "Why should I participate in this research? What's in it for me?",
                "answer": "We plan to have two kinds of participants in our study: paid panelists and volunteers. Paid panelists are people who will be recruited by professional survey companies, and these people will be directly paid for their participation. Volunteers are just that: people who want to contribute data to this study without receiving any reward. Although volunteers do not receive any direct benefits, they can feel good about contributing to science and helping us study pressing issues on the web, like the spread of misinformation."
            },
            {
                "question": "What browsers are compatible with this study?",
                "answer": "Our extension currently supports Chrome and Firefox."
            },
            {
                "question": "How can I contribute to this research?",
                "answer": "We're glad to hear that you are interested! We plan to have two kinds of participants in our study: paid panelists and volunteers. Paid panelists will be recruited by professional survey companies. The only way to become a paid panelist is to be contacted by one of these survey companies. In the future, we plan to open our study up to volunteers. When we do so, we'll post more information on this website and possibly run advertisements around the web."
            },
            {
                "question": "What if I don't want to participate?",
                "answer": "That's okay! You are free to not participate in this study. Just don't install our browser extension, and you'll never hear from us again."
            },
            {
                "question": "What if I want to drop out of the study?",
                "answer": "We're sorry to see you go! You are free to uninstall our browser extension and leave the study at any time. If you want us to delete the data we collected from your browser while you were a participant, you may contact Professor Christo Wilson at <a href=\"mailto:cbw@ccs.neu.edu\">cbw@ccs.neu.edu</a>."
            },
            {
                "question": "How do I uninstall your browser extension?",
                "answer": "On Chrome, click the extended menu button (the vertical \"...\" button) in the upper-right hand corner of the browser and navigate the menu to <i>More tools</i> &gt; <i>Extensions</i>. The <b>Extensions</b> tab will open up. Find the <b>Web Usage Study</b> extension in the list and click the <i>Remove</i> button to uninstall our extension.<br><br>On Firefox, click the extended menu button (the button with the \"hamburger\"  icon, with the three horizontals stacked bars) in the upper-right hand corner of the browser and navigate the menu to <i>Add-ons</i>. The <b>Manage Your Extensions</b> tab will open. Find the <b>Web Usage Study</b> extension in the list, click the corresponding \"...\" button, and select <i>Remove</i> from the menu to uninstall our extension."
            },
            {
                "question": "Who should I contact if I have problems?",
                "answer": "If you have any questions about this research project, you may contact Professor Christo Wilson at <a href=\"mailto:cbw@ccs.neu.edu\">cbw@ccs.neu.edu</a>. If you have any questions about your rights as a research participant, you may contact Nan Regina, director for the office of Human Subjects Research Protection at <a href=\"mailto:n.regina@neu.edu\">n.regina@neu.edu</a>."
            },
            {
                "question": "Are there any risks to participating in this research?",
                "answer": "The risk to you, as a participant, is minimal. We are collecting basic demographic information, information about your internet habits, and copies of web pages that you visit. To the greatest extent possible, information that identifies you will be removed from all collected web data.<br><br>Because of the nature of electronic systems, it is possible, though unlikely, that respondents could be identified by some electronic record associated with the data we collect. Neither the researchers nor anyone involved with this study will be collecting those data. Any reports or publications based on this research will use only aggregate data and will not identify you or any individual as being affiliated with this project.<br><br>It is possible, though very unlikely, that data collected from you or your browser could be stolen from us. As detailed below, we implement a comprehensive set of cybersecurity measures to prevent theft of data or data breaches.<br><br>Since our browser extension will be actively visiting URLs from within participants\u2019 browsers, there is a risk that our actions will impact participants\u2019 online profiles, i.e., \u201cpollute them\u201d with actions that the person did not take. To mitigate this risk, our browser extension will only visit content that is benign, and will only execute searches for general terms (described in more detail below). For example, our browser extension may visit news videos on YouTube from major sources (e.g., CNN and Fox News), but will not visit videos from known purveyors of hyperpartisan misinformation."
            }
        ]
    },
    {
        "title": "Data Collection and Privacy",
        "contents": [
            {
                "question": "What kind of data do you collect from me?",
                "answer": "If you choose to participate in our study, our browser extension will collect four types of data from your browser.<ol><li>Browsing history, Google and YouTube account histories (e.g. searches, comments, clicks), and online advertising preferences (from Google, Oracle Data Cloud, Facebook). This data is initially collected for the year prior to the installation of our browser extension, and we then check these sources once every two weeks to collect updates until the study is completed.</li><li>Embedded YouTube and Twitter URLs on websites, i.e., what page you were visiting, and what YouTube videos and/or tweets were embedded in that page. This data is collected until the study is completed.</li><li>Copies of the HTML seen on specific sites: Google Search, Google News, YouTube, Facebook Newsfeed, and Twitter Feed. To the greatest extent possible we remove identifying information (e.g., your username and user ID) to anonymize the data before it leaves the browser. This data is collected until the study is completed.</li><li>Snapshots of selected URLs from your browser. For each URL, the extension saves a copy of the HTML that renders, effectively capturing what you would have seen had you visited that website yourself. Once a week we conduct searches on Google Search, Google News, Youtube, and Twitter, and collect the current frontpage of Google News, YouTube, Twitter, and other sources of news. These web page visits will occur in the background and will not affect the normal functioning of your browser.</li></ol> Additionally, if you choose to participate, you will be asked to take a survey in which we ask you several questions about your demographics, web usage, and media preferences. These data, as well as those mentioned above, will be used to analyze the correlations between your online behavior and your interest profiles."
            },
            {
                "question": "Do you collect my private messages from Facebook, Twitter, Google, or anywhere else?",
                "answer": "<b>No.</b> We do not collect private messages from social media websites. This includes messages on Facebook Messenger or Twitter Direct Messages, or emails in GMail."
            },
            {
                "question": "Why should I trust you with this data?",
                "answer": "Our research team has been conducting studies like this for many years. We have experience collecting survey data and using browser extensions to collect data. As detailed below, we are committed to the protecting the privacy of our participants, and we take concrete steps to make sure that your data is secured. We will never sell your data, or share it beyond the researchers who are approved to take part in this study.<br><br>Finally, our study and all the researchers involved in it have been reviewed and approved by the research ethics committees (known as Institutional Review Boards) at our respective universities. The research protocol that was reviewed and approved contains strong guarantees to protect the security and privacy of study participants. If we violate the approved research protocol, we would (at a minimum) get in a lot of trouble, and potentially lose our jobs."
            },
            {
                "question": "Am I anonymous?",
                "answer": "Participants in our study are <b>pseudonymous</b>. What that means is that we do not know participants' names, addresses, or other personally identifying information. Instead, participants in our study are identified by unique numbers; we only know you as \"Participant #672uYdzNgQjN\", for example."
            },
            {
                "question": "Why can't you anonymize my data?",
                "answer": "We identify each participant using a unique number because we want to study how people's behavior on the web varies. In other words, we can't study the behavior of individual people if we don't know who did what in our data. Furthermore, we may inadvertently collect data from your browser that identifies you uniquely. For example, if you Google Search your own name, that query would be collected by our browser extension and become part of our dataset. There is no way for us to remove all such potentially identifying information from the data. This is why we will never release raw data from this study; only aggregate information that has been fully anonymized will ever be discussed or made available publicly."
            },
            {
                "question": "What data does your extension collect from incognito/private browser windows?",
                "answer": "Our extension requires access to incognito/private browser windows in order to collect automated snapshots of webpages (described in more detail below). We only collect this automated data from incognito/private browser windows. We do not collect any data from web pages that you open in incognito/private browsing windows, and we do not record any browsing history from incognito/private browsing windows."
            },
            {
                "question": "Will you ever sell my data?",
                "answer": "<b>No.</b> Data collected during this study will never be sold to anyone."
            },
            {
                "question": "Will you ever share my data?",
                "answer": "<b>No.</b> Data that we collect from individuals (like your search queries or browsing history) will never be shared outside of our research group. That said, we are researchers and we do intend to publish blogs, papers, articles, and maybe even books based on the data we gather during this study. We will only ever publish aggregated data that does not identify individuals. For example, we could publish the top 50 websites visited by people in our study, or the top 10 queries about the US 2020 election searched on Google by the people in our study."
            },
            {
                "question": "How is my data being secured?",
                "answer": "We implement a number of mechanisms to make sure that data we collect remains secure.<ul><li>We use industry standard TLS encryption to secure data transfers from our browser extension to our servers.</li><li>The servers that store collected data are housed in a secure room at Northeastern University that is only accessible to staff that hold special key cards.</li><li>The servers that store collected data are hardened against common security threats using industry standard software like firewalls.</li><li>Access to collected data is limited to approved researchers from our team, and they may only access data after logging in with a secure SSH cryptographic key.</li><li>Raw data will never leave our secure servers; researchers will only ever download aggregated data that has been anonymized.</li><li>All accesses to our servers are securely logged.</li></ul>"
            }
        ]
    },
    {
        "title": "Webpage Snapshots",
        "contents": [
            {
                "question": "After I installed your extension, my browser started opening windows and visiting webpages on its own. What is going on?",
                "answer": "What you are noticing is a completely normal and expected behavior of our extension, namely the collection of webpage snapshots. One goal of our study is to measure if, and to what extent, specific websites personalize content based on their knowledge of you and your online activity. To measure this, we direct your browser to visit specific webpages so that we can copy them, effectively taking a \"snapshot\" of these webpages as they would have appeared to you. Our browser extension collects snapshots from normal and incognito/private browser windows at the same time. We do this because the incognito versions of the webpages don't have access to your cookies,"
            },
            {
                "question": "What kind of webpages does your extension take snapshots of?",
                "answer": "Our extension collects snapshots of three kinds webpages: <ol><li>Homepages of news and social media websites like Google News, Twitter trending topics, and YouTube trending videos</li><li>Search results for terms chosen by us (the researchers) from major search engines like Google Search and Twitter Search</li><li>Specific pieces of content from social media, such as videos selected by us (the researchers) from YouTube</li></ol>"
            },
            {
                "question": "Will the extension ever visit bad or embarrassing pages?",
                "answer": "<b>No.</b> Our extension will never cause your browser to visit bad or embarrassing websites, bad or embarrassing webpages, or search for bad or embarrassing search terms. Our extension only visits benign, popular websites like Google Search, Twitter, and YouTube; only searches for neutral, everyday queries; and only visits neutral, everyday content on social media like videos from major news networks."
            },
            {
                "question": "What is \"profile pollution\" and should I be worried about this?",
                "answer": "Our extension visits websites and runs search queries automatically in the background. These are actions that you might not have taken yourself. This creates a theoretical risk of \"profile pollution\" – that this extension will impact your online profiles, i.e., \"pollute\" them with actions that you did not take. To mitigate this risk, the extension will only visit content that is benign and will only execute searches for general terms. Our previous work has found that historical information of this kind has minimal impact on online services."
            },
            {
                "question": "Why does your extension need access to Incognito/Private mode in my browser?",
                "answer": "Our extension requests access to Incognito/Private mode after installation. We ask for this permission in order to collect snapshots of webpages from within your browser with and without cookies. One goal of our study is to measure if, and to what extent, specific websites personalize content based on their knowledge of each participant, and websites use cookies to track this knowledge. Access to Incognito mode allows the extension to conduct a what-if analysis, i.e., what if you visited a specific website with and without cookies?"
            }
        ]
    },
    {
        "title": "Browser Extension Permissions",
        "contents": [
            {
                "question": "Why does your extension need the \"alarms\" permission?",
                "answer": "The extension collects periodic snapshots of webpages in the background. We use alarms to manage these periodic tasks."
            },
            {
                "question": "Why does your extension need the \"cookies\" permission?",
                "answer": "Our study interfaces with three web services (Google, Facebook, and Twitter) that require being logged-in to function. To make sure that participants are indeed logged in to these services, we check for the presence of session cookies associated with these services. We do not record or make copies of these cookies, we simply check for their existence."
            },
            {
                "question": "Why does your extension need the \"history\" permission?",
                "answer": "Our study relies, in part, on data from participants' browsing history. Thus, our extension requires this permission to collect this data."
            },
            {
                "question": "Why does your extension need the \"notifications\" permission?",
                "answer": "The extension collects periodic snapshots of webpages in the background. We use notifications to warn the user several minutes before this data collection occurs, so they will not be surprised when the browser opens up two new windows."
            },
            {
                "question": "Why does your extension request access to google.com, facebook.com, and twitter.com?",
                "answer": "As noted above, our extension requires access to data from Google, Facebook, and Twitter in order to check whether the user is logged-in to these services. This is why the extension requests access to these three specific domains."
            },
            {
                "question": "Why does your extension request access to http://* and https://* URLs?",
                "answer": "Our extension  requires access to all tabs containing websites (e.g., http://* and https://* URLs). One goal of our study is to examine participants' exposure to misinformation and hate speech, which can potentially occur on any website."
            },
            {
                "question": "Why does your extension need access to Incognito/Private mode in my browser?",
                "answer": "Our extension requests access to Incognito/Private mode after installation. We ask for this permission in order to collect snapshots of webpages from within your browser with and without cookies. One goal of our study is to measure if, and to what extent, specific websites personalize content based on their knowledge of each participant, and websites use cookies to track this knowledge. Access to Incognito mode allows the extension to conduct a what-if analysis, i.e., what if you visited a specific website with and without cookies?"
            }
        ]
    }
]
