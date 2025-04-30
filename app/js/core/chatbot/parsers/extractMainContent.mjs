import { detectChoiceOption } from "./detectChoiceOption.mjs";
import { detectedResponseTitle } from "./detectResponseTitle.mjs";
import {
	handleNewResponseTitle,
	handleKeywords,
	handleDynamicContent,
	handleChoiceOptions,
	handleRegularContent,
} from "./helpers/processorsMainContent.mjs";

export function getMainContentInformations(
	mdWithoutYaml,
	indexEndIntroduction,
	yaml,
) {
	const mainContent = mdWithoutYaml.substring(indexEndIntroduction);
	const mainContentLines = mainContent.split("\n");
	const chatbotData = [];

	const currentData = {
		responseTitle: null,
		keywords: [],
		content: [],
		choiceOptions: null,
		listParsed: false,
		ifCondition: "",
	};

	for (let line of mainContentLines) {
		// Gestion des titres de réponse
		if (detectedResponseTitle(line, yaml)) {
			handleNewResponseTitle(line, yaml, currentData, chatbotData);
			continue;
		}

		// Gestion des mots clés
		if (line.startsWith("- ") && !currentData.listParsed) {
			handleKeywords(line, currentData);
			continue;
		}

		// Gestion des blocs conditionnels si on a du contenu dynamique
		if (handleDynamicContent(line, currentData, yaml)) {
			continue;
		}

		// Gestion des éventuelles options de choix proposées en fin de réponse
		const choiceStatus = detectChoiceOption(line);
		if (choiceStatus.isChoice) {
			handleChoiceOptions(line, choiceStatus, yaml, currentData);
			continue;
		}

		// Gestion du reste du contenu de la réponse
		handleRegularContent(line, yaml, currentData);
	}

	chatbotData.push([
		currentData.responseTitle,
		currentData.keywords,
		currentData.content,
		currentData.choiceOptions,
	]);

	return chatbotData;
}
