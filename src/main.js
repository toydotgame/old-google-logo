/*
 * AUTHOR: toydotgame
 * CREATED ON: 2024-06-14
 * Main class containing general methods; run when a Google domain is loaded.
 */

// Enables verbose debug logging. Not for production
const debug = false;

var logos = [
	{"id": "nav",                    "src": browser.runtime.getURL("/resources/google/nav.png")},
	{"id": "maps_favicon",           "src": browser.runtime.getURL("/resources/google/favicons/maps.ico")},
	{"id": "search_favicon",         "src": browser.runtime.getURL("/resources/google/favicons/search.ico")},
	{"id": "search_alt_favicon",     "src": browser.runtime.getURL("/resources/google/favicons/search_alt.ico")},
	{"id": "finance_favicon",        "src": browser.runtime.getURL("/resources/google/favicons/finance.ico")},
	{"id": "scholar_favicon",        "src": browser.runtime.getURL("/resources/google/favicons/scholar.ico")},
	{"id": "news_favicon",           "src": browser.runtime.getURL("/resources/google/favicons/news.ico")},
	{"id": "earth_favicon",          "src": browser.runtime.getURL("/resources/google/favicons/earth.ico")},
	{"id": "books",                  "src": browser.runtime.getURL("/resources/google/logos/books.png")},
	{"id": "finance_left",           "src": browser.runtime.getURL("/resources/google/logos/finance_left.png")},
	{"id": "finance_right",          "src": browser.runtime.getURL("/resources/google/logos/finance_right.png")},
	{"id": "g",                      "src": browser.runtime.getURL("/resources/google/logos/g.png")},
	{"id": "maps",                   "src": browser.runtime.getURL("/resources/google/logos/maps.png")},
	{"id": "maps_watermark_mono",    "src": browser.runtime.getURL("/resources/google/logos/maps_watermark_mono.png")},
	{"id": "maps_watermark",         "src": browser.runtime.getURL("/resources/google/logos/maps_watermark.png")},
	{"id": "news_left",              "src": browser.runtime.getURL("/resources/google/logos/news_left.png")},
	{"id": "news",                   "src": browser.runtime.getURL("/resources/google/logos/news.png")},
	{"id": "news_right",             "src": browser.runtime.getURL("/resources/google/logos/news_right.png")},
	{"id": "patents",                "src": browser.runtime.getURL("/resources/google/logos/patents.png")},
	{"id": "scholar",                "src": browser.runtime.getURL("/resources/google/logos/scholar.png")},
	{"id": "search",                 "src": browser.runtime.getURL("/resources/google/logos/search.png")},
	{"id": "shopping_left",          "src": browser.runtime.getURL("/resources/google/logos/shopping_left.png")},
	{"id": "shopping",               "src": browser.runtime.getURL("/resources/google/logos/shopping.png")},
	{"id": "shopping_right",         "src": browser.runtime.getURL("/resources/google/logos/shopping_right.png")},
	{"id": "trends",                 "src": browser.runtime.getURL("/resources/google/logos/trends.png")},
	{"id": "videos",                 "src": browser.runtime.getURL("/resources/google/logos/videos.png")},
	{"id": "earth",                  "src": browser.runtime.getURL("/resources/google/logos/earth.png")}
];

var supportedDomains = ["patents", "scholar", "books", "shopping", "news", "trends", "www", "images", "earth"];
var supportedPages = ["/maps", "/videohp", "/finance", "/travel", "/", "/webhp", "/imghp", "/search"];

var config;

var subdomain = window.location.host.split(".")[0];
var page = "/" + window.location.pathname.split("/")[1];

if(supportedDomains.includes(subdomain) || supportedPages.includes(page)) {
	Main();
} // End of execution if false

/*
 * void Main()
 * Run if page is on a supported domain. Runs unique replace.js methods to replace logos
 */
function Main() {
	DebugLog(
		"Welcome to Old Google v" + browser.runtime.getManifest().version + "!\n" +
		"Copyright (c) 2021 toydotgame\n" +
		"subdomain = \"" + subdomain + "\", page = \"" + page + "\""
	);
	
	LoadConfig().then(cachedConfig => {
		config = cachedConfig;
		DebugLog("Config loaded:"); if(debug) console.table(config);

		switch (subdomain) {
			case "patents":
				Replace_Patents();
				break;
			case "scholar":
				Replace_Scholar();
				break;
			case "books":
				if(page == "/ngrams") {
					Replace_Ngrams();
					break;
				}
				Replace_Books();
				break;
			case "shopping":
				Replace_Shopping();
				break;
			case "news":
				Replace_News();
				break;
			case "trends":
				Replace_Trends();
				break;
			case "earth":
				Replace_Earth();
				break;
			case "www":
			case "images":
				switch(page) {
					case "/maps":
						Replace_Maps();
						break;
					case "/videohp":
						Replace_Videos();
						break;
					case "/finance":
						Replace_Finance();
						break;
					case "/travel":
						Replace_Travel();
						break;
					case "/books":
						Replace_Books(); // New Books results page
						break;
					case "/":
					case "/webhp":
					case "/imghp":
						Replace_Search_Styles();
						Replace_Search_Home();
						break;
					case "/search":
						Replace_Search_Styles();
						Replace_Search_Results();
						break;
				}
		}
	}).catch(e => {
		DebugLog(
			"ERROR: Fatal error; exiting!\n" +
			e +
			" (" + e.fileName.substring(e.fileName.lastIndexOf("/") + 1) + ":" + e.lineNumber + "," + e.columnNumber + ")\n" + 
			e.stack
		);
	});
}

/*
 * String GetResource(String id)
 * Returns a moz-extension:// URI for the resource with the input
 * namespaced ID. Returns empty string if not found
 */
function GetResource(id) {
	try {
		return logos.find(x => x.id == id).src;
	} catch(TypeError) {
		return "";
	}
}

/*
 * boolean GetConfig(String id)
 * Returns true/false for given input setting ID
 * Returns false if key does not exist
 */
function GetConfig(id) {
	var value;
	try {
		value = config.find(x => x.id == id).value;
	} catch(TypeError) {
		value = false;
	}
	return value;
}

/*
 * void DebugLog(String message)
 * Fancy console.log() wrapper that only prints if the debug const is true
 * If you prepend "ERROR: " to your message string, the message prints in red
 */
function DebugLog(message) {
	if(debug) {
		var messageColor = "reset";
		var isErrorMessage;
		try {
			isErrorMessage = message.startsWith("ERROR: ");
		} catch(TypeError) {}
		if(isErrorMessage) {
			message = message.replace(/ERROR: /, "");
			messageColor = "#f00";
		}
		var caller = "";
		try {
			if(DebugLog.caller.name.length != 0) {
				caller = "[" + DebugLog.caller.name + "()] ";
			}
		} catch(TypeError) {}
		console.log("%c[%cOld Google%c]%c " + caller + message,
			"background-color:#4d90fe; color:#222",
			"background-color:#4d90fe; color:#fff",
			"background-color:#4d90fe; color:#222",
			"color:" + messageColor + "; background-color:reset");
	}
}

/*
 * void RunWhenReady(String[] selectors | String selector, function code)
 * Takes querySelector() string(s) and runs the provided code once the earliest
 * element in the array (or just the single provided element) is loaded into DOM
 * Provides a DOMObject `loadedElement` for use in the code that corresponds to
 * the aforementioned first loaded element
 */
function RunWhenReady(selectors, code) {
	if(typeof selectors == "string") {
		selectors = [selectors];
	}
	try {
		DebugLog("RunWhenReady(\"" + selectors.join("\", \"") + "\"): Run from " + (new Error).stack.split("\n")[1].split("/")[4]);
	} catch(TypeError) {
		DebugLog("RunWhenReady(\"" + selectors.join("\", \"") + "\"): Running...");
	}

	var loadedElement, isLoaded;
	function GetLoadedElement(mutationInstance = null) {
		for(var i = 0; i < selectors.length; i++) {
			try {
				loadedElement = document.querySelector(selectors[i])
			} catch(TypeError) {}
			if(loadedElement != null) {
				DebugLog("RunWhenReady(\"" + selectors.join("\", \"") + "\"): Loaded.");
				code(loadedElement);
				if(mutationInstance != null) { // Running in observer:
					mutationInstance.disconnect();
					break;
				} // Running in function scope:
				isLoaded = true;
				break;
			}
		}
	}

	GetLoadedElement(); // Run check if the element has loaded before the observer can start
	if(isLoaded)
		return;

	var observer = new MutationObserver(function (mutations, mutationInstance) {
		GetLoadedElement(mutationInstance);
	});
	observer.observe(document, {childList: true, subtree: true});
}

/*
 * void InjectCssAtHead(String styles, boolean? quickReplace)
 * Appends the given inline styles to the <head> element in a safe manner
 * Runs when the body starts loading, unless quickReplace is true
 * quickReplace is to be true if this method is called from within a
 * RunWhenReady() function that guarantees <body> has started loading
 */
function InjectCssAtHead(styles, quickReplace = false) {
	DebugLog("Injecting CSS into document...");
	var styleElement = document.createElement("style");
	styleElement.appendChild(document.createTextNode(styles));
	if(quickReplace) {
		document.head.append(styleElement);
		return;
	}
	RunWhenReady("body", function(loadedElement) {
		document.head.append(styleElement);
	});	
}

/*
 * void SetFavicon(String id, boolean? quickReplace)
 * Sets the favicon to the resource at the provided ID, safely
 * Like in InjectCssAtHead, the same quickReplace option is available here
 */
function SetFavicon(id, quickReplace = false) {
	DebugLog("Setting favicon to " + id + "...");
	var faviconElement = Object.assign(
		document.createElement("link"),
		{rel: "icon", href: GetResource(id)}
	);
	if(quickReplace) {
		document.head.append(faviconElement);
		return;
	}
	RunWhenReady("body", function(loadedElement) {
		document.head.append(faviconElement);
	});		
}
