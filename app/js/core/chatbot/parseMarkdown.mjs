import { removeYaml } from "./parsers/helpers/removeYaml.mjs";
import {
	extractIntroduction,
	extractInformationsFromInitialMessage,
} from "./parsers/extractIntroduction.mjs";
import { getMainContentInformations } from "./parsers/extractMainContent.mjs";
import { processFixedVariables } from "../../markdown/custom/variablesFixed.mjs";

export function parseMarkdown(md, yaml) {
	// Fix pour l'utilisation de \\ dans le Latex
	md = md.replaceAll("\\\\", "&#92;&#92;");
	md = md.replaceAll("\r", "\n");

	// On récupère le contenu principal sans l'en-tête YAML s'il existe
	md = removeYaml(md);

	// On traite les variables fixes s'il y en a
	if (yaml && yaml.variables) {
		md = processFixedVariables(md, true);
	}

	// On récupère l'introduction du Chatbot (titre et message initial)
	const chatbotIntroduction = extractIntroduction(md);

	// On récupère les informations contenues dans le message intial (contenu et choix proposés par le chatbot)
	const chatbotInitialMessageInformations =
		extractInformationsFromInitialMessage(
			chatbotIntroduction.chatbotInitialMessage,
			yaml,
		);

	// On récupère les informations contenues dans le contenu principal et on crée la structure de données du chatbot
	let chatbotData = {
		responses: getMainContentInformations(
			md,
			chatbotIntroduction.indexEnd,
			yaml,
		),
		initialMessage: chatbotInitialMessageInformations,
		title: chatbotIntroduction.chatbotTitle,
	};

	return chatbotData;
}
