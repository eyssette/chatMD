import { config } from "../../../config.mjs";
import { handleURL } from "../../../utils/urls.mjs";

// Pour récupérer le contenu d'un fichier à partir d'une URL directe
export async function fetchContent(url) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Erreur lors de la récupération du fichier : ${url}`);
	}
	return response.text();
}

// Pour récupérer le contenu d'un fichier à partir d'une URL en utilisant un proxy si besoin
export async function fetchContentWithProxyIfNeeded(url) {
	try {
		return await fetchContent(url);
	} catch (error) {
		const proxiedUrl = config.corsProxy + url;
		console.warn(`Fetch direct échoué, tentative avec proxy : ${proxiedUrl}`);
		console.log(error);
		return await fetchContent(proxiedUrl);
	}
}

// Pour récupérer le contenu de plusieurs fichiers à partir d'un tableau d'URLS
export async function fetchContentFromMultipleSources(urls) {
	const contents = await Promise.all(
		urls.map((url) => fetchContent(handleURL(url))),
	);
	return contents.join("\n");
}
