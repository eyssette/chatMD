import { config } from "../../../config.mjs";
import { handleURL } from "../../../utils/urls.mjs";

// Pour récupérer le contenu d'un fichier à partir d'une URL directe
export async function fetchContent(url) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Erreur lors de la récupération du fichier : ${url}`);
	}
	if (url.includes("docs.numerique.gouv.fr/")) {
		// Cas particulier des fichiers hébergés sur Docs de La Suite numérique
		// Le contenu est un JSON qu'il faut traiter pour en extraire le Markdown
		let content = await response.json().then((data) => {
			const markdownContent = `${data.content}`.replaceAll("***", "---");
			return markdownContent;
		});
		// Patch pour la gestion des déclencheurs
		// Docs ajoute un double retour à la ligne entre les titres de niveau 2 et le début d'une liste à puce (qui commence toujours par "* " dans Docs)
		// On remplace d'abord ces doubles retours à la ligne par un simple retour à la ligne
		content = content.replace(/(## .+)\n\n(\* .+)/g, "$1\n$2");
		// On remplace ensuite les "* " par des "- " pour que les listes à puce utilisent la syntaxe avec des tirets
		content = content.replace(/^\* /gm, "- ");
		return content;
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
		urls.map((url) => fetchContentWithProxyIfNeeded(handleURL(url))),
	);
	return contents.join("\n");
}
