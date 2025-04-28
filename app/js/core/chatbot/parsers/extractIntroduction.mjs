import { regexOrderedList, regexOrderedListRandom } from "../parseMarkdown.mjs";

export function extractIntroduction(mdWithoutYaml) {
	// On récupère la séparation entre la première partie des données (titre + message principal) et la suite avec les réponses possibles
	const mdWithoutYamlAndWithoutH1 = mdWithoutYaml.substring(1);
	const possibleTitles = ["# ", "## ", "### ", "#### ", "##### "];
	const indexOfFirstTitles = possibleTitles
		.map((title) => mdWithoutYamlAndWithoutH1.indexOf(title))
		.filter((index) => index > 0);
	const indexEndIntroduction = Math.min(...indexOfFirstTitles);
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
		chatbotTitle: chatbotTitle ? [chatbotTitle.replace("# ", "").trim()] : [""],
	};
}

export function extractInformationsFromInitialMessage(
	chatbotInitialMessage,
	yaml,
) {
	const initialMessageContentLines = chatbotInitialMessage.split("\n");
	let initialChoices = [];
	let initialMessageContentArray = [];
	let randomOrder = false;
	for (let line of initialMessageContentLines) {
		line = line.replace(/^>\s?/, "");
		if (regexOrderedList.test(line)) {
			// Récupération des options dans le message initial, s'il y en a
			randomOrder = regexOrderedListRandom.test(line);
			const listContent = line.replace(/^\d+(\.|\))\s/, "").trim();
			let link = listContent.replace(/^\[.*?\]\(/, "").replace(/\)$/, "");
			link = yaml.obfuscate ? btoa(link) : link;
			const text = listContent.replace(/\]\(.*/, "").replace(/^\[/, "");
			initialChoices.push([text, link, randomOrder]);
		} else {
			initialMessageContentArray.push(line);
		}
	}
	//return { choices: initialChoices, contentArray: initialMessageContentArray };
	return [initialMessageContentArray, initialChoices];
}
