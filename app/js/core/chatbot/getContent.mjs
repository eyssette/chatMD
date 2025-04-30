import { handleURL } from "../../utils/urls.mjs";
import {
	fetchContentFromMultipleSources,
	fetchContentWithProxyIfNeeded,
} from "./helpers/fetch.mjs";
import { processYAML } from "../../markdown/custom/yaml.mjs";
import { validateMarkdown } from "./helpers/validate.mjs";

export async function getContent(defaultMd) {
	let content = defaultMd;
	let yaml;
	// On récupère la source du chatbot dans le hash s'il y en a une
	const url = window.location.hash.substring(1).replace(/\?.*/, "");
	// On traite l'URL pour pouvoir récupérer correctement la source du chatbot
	const sourceChatBot = handleURL(url);

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
		content = validateMarkdown(content);
	}
	return { markdown: content, yaml: yaml ? yaml : processYAML(content) };
}
