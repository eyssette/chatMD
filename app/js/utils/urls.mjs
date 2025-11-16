import { config } from "../config.mjs";

function handleShorcuts(url) {
	const foundShortcut = config.shortcuts.find(
		([shortcutUrl]) => shortcutUrl === url,
	);
	return foundShortcut ? foundShortcut[1] : url;
}

function isAuthorized(url) {
	return config.authorizedChatbots.find((element) => element == url);
}

// Gestion des fichiers hébergés sur github
function handleURLfromGithub(url) {
	return url
		.replace("https://github.com", "https://raw.githubusercontent.com")
		.replace("/blob/", "/");
}

// gestion des fichiers hébergés sur codiMD / le pad gouv / hedgedoc / digipage
function isCodimdURL(url) {
	return (
		url.startsWith("https://codimd") ||
		url.startsWith("https://pad.numerique.gouv.fr/") ||
		url.includes("hedgedoc") ||
		url.includes("digipage")
	);
}
function handleURLfromCodimd(url) {
	url = url
		.replace("?edit", "")
		.replace("?both", "")
		.replace("?view", "")
		.replace(/#$/, "")
		.replace(/\/$/, "");
	url = url.indexOf("download") === -1 ? url + "/download" : url;
	return url;
}

// gestion des fichiers hébergés sur framapad ou digidoc
function isFramapadURL(url) {
	return (
		(url.includes("framapad") || url.includes("digidoc")) &&
		!url.endsWith("/export/txt")
	);
}
function handleURLfromFramapad(url) {
	return url.replace(/\?.*/, "") + "/export/txt";
}

function handleKnownHosts(url, shouldAddCorsProxy) {
	if (url.includes(".forge")) {
		shouldAddCorsProxy = false;
	} else if (url.startsWith("https://github.com")) {
		shouldAddCorsProxy = false;
		url = handleURLfromGithub(url);
	} else if (isCodimdURL(url)) {
		shouldAddCorsProxy = false;
		url = handleURLfromCodimd(url);
	} else if (isFramapadURL(url)) {
		shouldAddCorsProxy = false;
		url = handleURLfromFramapad(url);
	}
	return { url, shouldAddCorsProxy };
}

export function normalizeUrl(url, options) {
	let shouldAddCorsProxy = options && options.useCorsProxy ? true : false;
	const hostResult = handleKnownHosts(url, shouldAddCorsProxy);
	url = hostResult.url;
	shouldAddCorsProxy = hostResult.shouldAddCorsProxy;
	return shouldAddCorsProxy ? config.corsProxy + url : url;
}

// Pour gérer l'URL de la source du chatbot
export function handleURL(url, options) {
	if (!url) return url;

	// Gestion du mode sécurisé qui ne laisse passer que les chatbots autorisés
	if (config.secureMode && !isAuthorized(url)) {
		return "";
	}

	// Gestion des éventuels raccourcis
	url = handleShorcuts(url);

	if (typeof url == "string") {
		return normalizeUrl(url, options);
	} else {
		return url.map((element) => normalizeUrl(element, options));
	}
}

// Pour charger des scripts
export function loadScript(src) {
	return new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = src;
		script.onload = resolve;
		script.onerror = reject;
		document.head.appendChild(script);
	});
}

// Pour charger des CSS
export function loadCSS(src) {
	return new Promise((resolve, reject) => {
		let styleElement;
		if (src.startsWith("<style>")) {
			styleElement = document.createElement("style");
			styleElement.textContent = src
				.replace("<style>", "")
				.replace("</style>", "");
		} else {
			styleElement = document.createElement("link");
			styleElement.href = src;
			styleElement.rel = "stylesheet";
			styleElement.onload = resolve;
			styleElement.onerror = reject;
		}
		document.head.appendChild(styleElement);
	});
}

// Pour gérer les paramètres dans l'URL
export function getParamsFromURL(
	queryString = window.location.search,
	urlHash = window.location.hash,
) {
	const paramsFromQuery = Object.fromEntries(new URLSearchParams(queryString));
	// Version sécurisée (hashHasParams) : les paramètres sont dans le hash et ne sont donc pas envoyés au serveur
	const hashHasParams = urlHash.includes("?") && urlHash.includes("=");
	const hashQueryPart = hashHasParams ? urlHash.split("?")[1] : "";
	const paramsFromHash = hashHasParams
		? Object.fromEntries(new URLSearchParams(hashQueryPart))
		: {};

	// Les paramètres dans le hash (#hash?p=1) écrasent les paramètres classiques dans l'URL (?p=2)
	return {
		...paramsFromQuery,
		...paramsFromHash,
	};
}

// Pour ouvrir un nouveau chatbot
export function goToNewChatbot(
	urlNewChatbot,
	URLbaseChatbot = window.location.origin + window.location.pathname,
) {
	if (urlNewChatbot && urlNewChatbot.indexOf(".") > -1) {
		URLbaseChatbot =
			!URLbaseChatbot || URLbaseChatbot == "null" ? "" : URLbaseChatbot;
		const fullUrl = URLbaseChatbot + `/#${urlNewChatbot}`;
		window.open(fullUrl, "_blank");
	} else {
		window.alert("Veuillez entrer une URL valide.");
	}
}
