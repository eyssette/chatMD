import { config } from "../../../config.mjs";
import { detectChoiceOption } from "./helpers/detectChoiceOption.mjs";

export function extractIntroduction(mdWithoutYaml) {
	// On récupère la séparation entre la première partie des données (titre + message principal) et la suite avec les réponses possibles
	mdWithoutYaml = mdWithoutYaml.trim();
	const mdWithoutYamlAndWithoutH1 = mdWithoutYaml.substring(1);
	const possibleTitles = ["# ", "## ", "### ", "#### ", "##### "];
	const indexOfFirstTitles = possibleTitles
		.map((title) => mdWithoutYamlAndWithoutH1.indexOf(title))
		.filter((index) => index > 0);
	const indexEndIntroduction =
		indexOfFirstTitles.length > 0
			? Math.min(...indexOfFirstTitles) + 1
			: mdWithoutYaml.length;
	const chatbotIntroduction = mdWithoutYaml.substring(0, indexEndIntroduction);
	// Gestion du titre
	const chatbotTitleMatch = chatbotIntroduction.match(/# .*/);
	const chatbotTitle = chatbotTitleMatch ? chatbotTitleMatch[0] : "Chatbot";
	const indexStartTitle = chatbotIntroduction.indexOf(chatbotTitle);
	// Gestion du message initial
	const initialMessageContent = chatbotTitleMatch
		? chatbotIntroduction.substring(indexStartTitle + chatbotTitle.length)
		: chatbotIntroduction.substring(indexStartTitle);
	return {
		indexEnd: indexEndIntroduction,
		chatbotInitialMessage: initialMessageContent,
		chatbotTitle: chatbotTitle ? chatbotTitle.replace("# ", "").trim() : "",
	};
}

export function extractInformationsFromInitialMessage(
	chatbotInitialMessage,
	yaml,
) {
	const initialMessageContentLines = chatbotInitialMessage.split("\n");
	let initialChoiceOptions = [];
	let initialMessageContentArray = [];
	for (let line of initialMessageContentLines) {
		line = line.replace(/^>\s?/, "");
		const choiceInformations = detectChoiceOption(line);
		if (choiceInformations.isChoice) {
			// Récupération des options dans le message initial, s'il y en a
			let link = choiceInformations.url;
			link = yaml && yaml.obfuscate ? btoa(link) : link;
			let text = choiceInformations.text;
			initialChoiceOptions.push({
				text: text ? text : config.defaultChoiceOptionText,
				link: link,
				isRandom: choiceInformations.isRandom,
			});
		} else {
			initialMessageContentArray.push(line);
		}
	}
	return {
		content: initialMessageContentArray,
		choiceOptions: initialChoiceOptions,
	};
}
