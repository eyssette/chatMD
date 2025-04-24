import { config } from "../config.mjs";

// Pour gérer l'URL de la source du chatbot
export function handleURL(url, options) {
	if (url !== "") {
		let addCorsProxy = options && options.useCorsProxy ? true : false;
		// Vérification de la présence d'un raccourci
		const shortcut = config.shortcuts.find((element) => element[0] == url);
		if (shortcut) {
			url = shortcut[1];
			// Si on a un raccourci, on n'a pas besoin de traiter correctement l'url
			return url;
		}
		if (config.secureMode) {
			const authorizedChatbot = config.authorizedChatbots.find(
				(element) => element == url,
			);
			if (authorizedChatbot) {
				url = authorizedChatbot;
			} else {
				return "";
			}
		}
		// Gestion des fichiers hébergés sur la forge et publiés sur une page web
		if (url.includes(".forge")) {
			addCorsProxy = false;
		}
		// Gestion des fichiers hébergés sur github
		if (url.startsWith("https://github.com")) {
			addCorsProxy = false;
			url = url.replace(
				"https://github.com",
				"https://raw.githubusercontent.com",
			);
			url = url.replace("/blob/", "/");
		}
		// gestion des fichiers hébergés sur codiMD / le pad gouv / hedgedoc / digipage
		if (
			url.startsWith("https://codimd") ||
			url.startsWith("https://pad.numerique.gouv.fr/") ||
			url.includes("hedgedoc") ||
			url.includes("digipage")
		) {
			addCorsProxy = false;
			url = url
				.replace("?edit", "")
				.replace("?both", "")
				.replace("?view", "")
				.replace(/#$/, "")
				.replace(/\/$/, "");
			url = url.indexOf("download") === -1 ? url + "/download" : url;
		}
		// gestion des fichiers hébergés sur framapad ou digidoc
		if (
			(url.includes("framapad") || url.includes("digidoc")) &&
			!url.endsWith("/export/txt")
		) {
			addCorsProxy = false;
			url = url.replace(/\?.*/, "") + "/export/txt";
		}
		url = addCorsProxy ? config.corsProxy + url : url;
	}
	return url;
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
	const hashHasParams = urlHash.includes("?");
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
export function goToNewChatbot(urlNewChatbot) {
	if (urlNewChatbot && urlNewChatbot.indexOf(".") > -1) {
		const fullUrl = window.location.origin + `/#${urlNewChatbot}`;
		window.open(fullUrl, "_blank");
	} else {
		alert("Veuillez entrer une URL valide.");
	}
}
