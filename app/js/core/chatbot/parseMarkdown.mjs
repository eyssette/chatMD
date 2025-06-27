import { removeYaml } from "./parsers/helpers/removeYaml.mjs";
import { extractIntroduction } from "./parsers/extractIntroduction.mjs";
import { getChatbotInformations } from "./parsers/getChatbotInformations.mjs";
import { processFixedVariables } from "../../markdown/custom/variablesFixed.mjs";

export function parseMarkdown(md, yaml) {
	// Fix pour l'utilisation de \\ dans le Latex
	md = md.replaceAll("\\\\", "&#92;&#92;");
	// Fix pour les textes avec des fins de ligne CRLF
	md = md.replaceAll("\r\n", "\n");

	// On récupère le contenu principal sans l'en-tête YAML s'il existe
	md = removeYaml(md);

	// On traite les variables fixes s'il y en a
	if (yaml && yaml.variables) {
		md = processFixedVariables(md, true);
	}

	// On extrait dans le Mardown le contenu de l'introduction
	const introductionContent = extractIntroduction(md);
	const chatbotTitle = introductionContent.chatbotTitle;
	const initialMessage = introductionContent.chatbotInitialMessage;
	const indexEndIntroduction = introductionContent.indexEnd;

	const introduction = {
		indexEnd: indexEndIntroduction,
		chatbotTitle: chatbotTitle,
		initialMessage: initialMessage,
	};

	// On extrait les informations du chatbot dans la source en Markdown
	let chatbotInformations = getChatbotInformations(md, introduction, yaml);

	// On récupère les informations contenues dans l'introduction du chatbot
	const initialMessageContent = chatbotInformations[0].content;
	const initialMessageChoiceOptions = chatbotInformations[0].choiceOptions;

	// On supprime les informations de l'introduction du chatbot dans la liste des réponses possibles
	chatbotInformations.shift();

	// On crée la structure de données du chatbot
	let chatbotData = {
		responses: chatbotInformations,
		initialMessage: {
			content: initialMessageContent,
			choiceOptions: initialMessageChoiceOptions,
		},
		title: chatbotTitle,
	};

	return chatbotData;
}
