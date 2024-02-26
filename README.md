# Web Usage Study 0.8.0

## Summary

The goal of this data collection tool is to archive a user's behavior and the digital traces of their web experiences. We use a two point approach, involving the collection of ecological and controlled data. Ecological data includes a real user's behavior, their web account histories, and in some cases, real-time snapshots of the websites they visit. Controlled data includes snapshots of websites that we take from a user's computer, including select keyword searches on Google Search or YouTube.


This extension was used to collect data for the following studies:  

1. Robertson, R. E., Green, J., Ruck, D. J., Ognyanova, K., Wilson, C., & Lazer, D. (2023). Users choose to engage with more partisan news than they are exposed to on Google Search. *Nature*, 618, 342–348. DOI: [10.1038/s41586-023-06078-5](https://doi.org/10.1038/s41586-023-06078-5)  
2. Chen, A. Y., Nyhan, B., Reifler, J., Robertson, R. E., & Wilson, C. (2023). Subscriptions and external links help drive resentful users to alternative and extremist YouTube channels. *Science Advances*, 9(35). DOI: [10.1126/sciadv.add8080](https://doi.org/10.1126/sciadv.add8080)  
3. Gleason, J., Hu, D., Robertson, R. E., & Wilson, C. (2023). Google the gatekeeper: How search components affect clicks and attention. *Proceedings of the International AAAI Conference on Web and Social Media (ICSWM 2023)*, 17, 245–256. DOI: [10.1609/icwsm.v17i1.22142](https://doi.org/10.1609/icwsm.v17i1.22142)

<br>

## Data Collection Capacities

We used a browser extension in order to collect four types of data about users’ web browsing.

### Ecological Data

  1. Where people go (monitor API - passive)  
    Collection: tracking the meta data of users’ path through the web, including the URLs they visit and when they visited them.  
    Scope: absolute – we record everything (i.e. independent browser history).  
  2. What people saw (snapshot API - passive)  
    Collection: saving a copy of the HTML that was rendered when a user visited a URL.  
    Scope:  filtered to trigger on a set of pre-selected web domains, including, Google Search, YouTube, Facebook Newsfeed, Twitter Feed.  

### Controlled Data

  3. What people would have seen (snapshot API - active)  
    Collection: visiting URLs from users’ computers and saving a copy of the HTML that renders.  
    Scope: limited to pre-selected URLs (e.g. the YouTube homepage or a fixed Google Search) or dynamically discovered URLs (e.g. recursive algorithm interrogation). Can collect in a normal and a private window to measure personalization.  
  4. What websites know about people (history API - active)  
    Collection: automating the collection of data from various web services and accounts, including their browsing history, Google account, and ad preferences.  
    Scope: limited to pre-selected accounts and services, and by the kinds of data those services provide access to.  

<br>

## Technical Details

### Code Overview

The browser extension is written in JavaScript, HTML, CSS, and the [WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions), which is [compatible](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Browser_support_for_JavaScript_APIs) with Firefox and Chrome. It consists of APIs, Web Workers, and a system for communicating between them.

### Documentation

Throughout the project, we use [`jsdoc`](https://devhints.io/jsdoc) to document the browser extension code. To rebuild the documentation, install `node` and `jsdocs`, then run: `bash ./scripts/make_docs.sh`  

<br>

## Server

We used a Flask app built to receive and store data sent from extension in a MySQL database. Data storage format is specified in `application/models.py` and matches the format above.  

To start the server for local testing:
1. Create a virtual environment (`python3.6`) and install `requirements.txt`  
2. Open `./scripts/start_plaform.sh` and change `FLASK_ENV` to your virtualenv path  
3. Run `bash ./scripts/start_platform.sh`  
4. Flask will begin running on http://0.0.0.0:80/ and logging to the console  
5. Data targeted at the server (e.g. http://x.y.z.a:80/save_data) will be saved to a SQL database specified in `./sqlplatform/config.py`  

