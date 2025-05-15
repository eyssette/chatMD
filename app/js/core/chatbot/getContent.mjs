import { handleURL } from "../../utils/urls.mjs";
import {
	fetchContentFromMultipleSources,
	fetchContentWithProxyIfNeeded,
} from "./helpers/fetch.mjs";
import { processYAML } from "../../markdown/custom/yaml.mjs";
import { validateMarkdown } from "./helpers/validate.mjs";
import { decodeString } from "../../utils/strings.mjs";

export async function getContent(defaultMd, params) {
	let content = defaultMd;
	let yaml;
	// On récupère la source du chatbot dans le hash s'il y en a une
	const hash = window.location.hash.substring(1).replace(/\?.*/, "");

	// Si la source n'est pas une URL, mais directement le texte du chatbot (encodé en base64), on renvoie ce texte comme source
	if (params && params.raw) {
		const rawContent = decodeString(hash);
		return { markdown: rawContent, yaml: processYAML(rawContent) };
	}
	// Si la source est une URL, on la traite pour pouvoir récupérer correctement la source du chatbot
	let sourceChatBot = handleURL(hash);

	if (!sourceChatBot && navigator.language.includes("en-")) {
		sourceChatBot = "https://chatmd.forge.apps.education.fr/_i18n/index.en.md";
	}

	if (sourceChatBot) {
		if (Array.isArray(sourceChatBot)) {
			// Cas où la source est répartie dans plusieurs fichiers (via un raccourci qui indique de récupérer plusieurs fichiers)
			content = await fetchContentFromMultipleSources(sourceChatBot);
		} else {
			// Récupération du contenu du fichier
			content = await fetchContentWithProxyIfNeeded(sourceChatBot);
		}
		yaml = processYAML(content);
		if (yaml && yaml.include) {
			// Cas où on doit inclure le contenu d'autres fichiers à la suite du premier (fichiers définis dans l'en-tête YAML du premier fichier, avec le paramètre "include")
			const includes =
				typeof yaml.include === "object"
					? yaml.include
					: { include: yaml.include };
			const contentToInclude = await fetchContentFromMultipleSources(includes);
			content = content + "\n\n" + contentToInclude;
		}
		// On valide le Markdown, sinon on obtient un message d'erreur
		content = validateMarkdown(content, defaultMd);
	}
	return { markdown: content, yaml: yaml ? yaml : processYAML(content) };
}
