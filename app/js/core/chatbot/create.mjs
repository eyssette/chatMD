import { handleURL } from "../../utils/urls.mjs";
import {
	fetchContentFromMultipleSources,
	fetchContentWithProxyIfNeeded,
} from "./helpers/fetch.mjs";
import { processYAML } from "../../markdown/custom/yaml.mjs";
import { validateMarkdown } from "./helpers/validate.mjs";
import { parseMarkdown } from "./parseMarkdown.mjs";
import { controlChatbot } from "../interactions/controller.mjs";

// Pour créer le chatbot à partir d'une source en Markdown
export async function createChatbot(defaultMD) {
	// On récupère la source du chatbot dans le hash s'il y en a une
	const url = window.location.hash.substring(1).replace(/\?.*/, "");
	// On traite l'URL pour pouvoir récupérer correctement la source du chatbot
	const sourceChatBot = handleURL(url);

	let mdContent;

	try {
		if (sourceChatBot) {
			if (Array.isArray(sourceChatBot)) {
				// Cas où la source est répartie dans plusieurs fichiers (via un raccourci qui indique de récupérer plusieurs fichiers)
				mdContent = await fetchContentFromMultipleSources(sourceChatBot);
			} else {
				// Récupération du contenu du fichier
				mdContent = await fetchContentWithProxyIfNeeded(sourceChatBot);
			}
		} else {
			// S'il n'y a pas de source du Chatbot, on utilise le contenu par défaut
			mdContent = defaultMD;
		}

		const yaml = processYAML(mdContent);
		if (yaml && yaml.include) {
			// Cas où on doit inclure le contenu d'autres fichiers à la suite du premier (fichiers définis dans l'en-tête YAML du premier fichier, avec le paramètre "include")
			const includes =
				typeof yaml.include === "object"
					? yaml.include
					: { include: yaml.include };
			const contentToInclude = await fetchContentFromMultipleSources(includes);
			mdContent = mdContent + "\n\n" + contentToInclude;
		}
		// On valide le Markdown, sinon on obtient un message d'erreur
		mdContent = validateMarkdown(mdContent);

		// On traite le contenu en Markdown pour créer la structure du chatbot
		const chatData = parseMarkdown(mdContent, yaml);

		// On initialise le chatbot à partir de cette structure
		controlChatbot(chatData);
	} catch (error) {
		console.error(error);
	}
}
