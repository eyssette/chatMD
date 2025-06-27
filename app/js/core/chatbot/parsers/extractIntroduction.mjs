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
