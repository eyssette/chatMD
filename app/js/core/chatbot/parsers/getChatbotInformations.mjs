import { detectChoiceOption } from "./helpers/detectChoiceOption.mjs";
import { detectedResponseTitle } from "./helpers/detectResponseTitle.mjs";
import {
	handleNewResponseTitle,
	handleKeywords,
	handleDynamicContent,
	handleChoiceOptions,
	handleRegularContent,
} from "./helpers/processorsChatbotContent.mjs";

export function getChatbotInformations(mdWithoutYaml, introduction, yaml) {
	const indexEndIntroduction = introduction.indexEnd;
	const chatbotTitle = introduction.chatbotTitle;
	const initialMessage = introduction.initialMessage;
	const titleLine = chatbotTitle ? "## " + chatbotTitle : "## Chatbot";
	const introductionContent = titleLine + "\n" + initialMessage + "\n";
	const chatbotContent =
		introductionContent + mdWithoutYaml.substring(indexEndIntroduction);
	const chatbotContentLines = chatbotContent.split("\n");
	const chatbotData = [];

	const currentData = {
		responseTitle: null,
		keywords: [],
		content: [],
		choiceOptions: null,
		listParsed: false,
		condition: "",
	};

	let searchForKeywords = true;

	for (let line of chatbotContentLines) {
		// Gestion des titres de réponse
		if (detectedResponseTitle(line, yaml) || (titleLine && line == titleLine)) {
			if (titleLine && line == titleLine) {
				line = line.replace("## ", "");
			}
			handleNewResponseTitle(line, yaml, currentData, chatbotData);
			searchForKeywords = true;
			continue;
		}
		if (!line.trim()) {
			// Les keywords doivent être mis juste après le titre, sans ligne vide après le titre
			// Si on a sauté de ligne, c'est qu'on est passé à la suite du message
			searchForKeywords = false;
		}

		// Gestion des mots clés
		if (searchForKeywords && line.startsWith("- ") && !currentData.listParsed) {
			handleKeywords(line, currentData);
			continue;
		}

		// Gestion des blocs conditionnels si on a du contenu dynamique
		if (handleDynamicContent(line, currentData, yaml)) {
			continue;
		}

		// Gestion des éventuelles options de choix proposées en fin de réponse
		const choiceInformations = detectChoiceOption(line);
		if (choiceInformations.isChoice) {
			handleChoiceOptions(choiceInformations, yaml, currentData);
			continue;
		}

		// Gestion du reste du contenu de la réponse
		handleRegularContent(line, yaml, currentData);
	}
	chatbotData.push({
		title: currentData.responseTitle,
		keywords: currentData.keywords,
		choiceOptions: currentData.choiceOptions,
		content: currentData.content,
	});

	return chatbotData;
}
