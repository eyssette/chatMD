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
		// On essaie de récupérer le contenu directement de l'URL
		return await fetchContent(url);
	} catch (initialFetchError) {
		try {
			// Si cela ne marche pas, on essaie d'ajouter l'extension .md à la fin de l'URL
			// Si on déploie ChatMD avec des fichiers dans son dépôt, on peut alors utiliser des URLs plus significatives, sans avoir à ajouter le .md dans l'URL
			return await fetchContent(`${url}.md`);
		} catch (mdFetchError) {
			// Si cela ne marche pas, on reprend l'URL initiale et on essaie avec un proxy CORS
			const proxiedUrl = config.corsProxy + url;
			try {
				return await fetchContent(proxiedUrl);
			} catch (proxyFetchError) {
				console.error("Problème avec le fetch initial :", initialFetchError);
				console.error("Échec de l'ajout de l'extension .md :", mdFetchError);
				console.error("Échec de l'ajout du proxy :", proxyFetchError);
			}
		}
	}
}

// Pour récupérer le contenu de plusieurs fichiers à partir d'un tableau d'URLS
export async function fetchContentFromMultipleSources(urls) {
	const contents = await Promise.all(
		urls.map((url) => fetchContent(handleURL(url))),
	);
	return contents.join("\n");
}
