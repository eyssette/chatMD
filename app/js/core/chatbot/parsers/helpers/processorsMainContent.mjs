import {
	detectedResponseTitle,
	isStructureTitle,
} from "./detectResponseTitle.mjs";

const regexDynamicContentIfBlock = /`if (.*?)`/;

// Gestion des titres de réponse
export function handleNewResponseTitle(line, yaml, currentData, chatbotData) {
	if (currentData.responseTitle) {
		chatbotData.push([
			currentData.responseTitle,
			currentData.keywords,
			currentData.content,
			currentData.choiceOptions,
		]);
	}
	currentData.responseTitle = line
		.replace(detectedResponseTitle(line, yaml), "")
		.trim();
	currentData.keywords = [];
	currentData.choiceOptions = null;
	currentData.content = [];
	currentData.listParsed = false;
}

// Gestion des mots clés
export function handleKeywords(line, currentData) {
	currentData.keywords.push(line.replace("- ", "").trim());
}

// Gestion des blocs conditionnels si on a du contenu dynamique
export function handleDynamicContent(line, currentData, yaml) {
	if (yaml.dynamicContent && regexDynamicContentIfBlock.test(line)) {
		currentData.ifCondition =
			(line.match(regexDynamicContentIfBlock) &&
				line.match(regexDynamicContentIfBlock)[1]) ||
			"";

		currentData.content.push(line + "\n");
		currentData.listParsed = true;
		return true;
	}
	if (yaml.dynamicContent && line.includes("`endif`")) {
		currentData.ifCondition = "";
		currentData.content.push(line + "\n");
		currentData.listParsed = true;
		return true;
	}
	return false;
}

// Gestion des éventuelles options de choix proposées en fin de réponse
export function handleChoiceOptions(line, choiceStatus, yaml, currentData) {
	currentData.listParsed = false;
	if (!currentData.choiceOptions) {
		currentData.choiceOptions = [];
	}
	const listContent = line.replace(/^\d+(\.|\))\s/, "").trim();
	let link = listContent.replace(/^\[.*?\]\(/, "").replace(/\)$/, "");
	link = yaml.obfuscate ? btoa(link) : link;
	const text = listContent.replace(/\]\(.*/, "").replace(/^\[/, "");
	currentData.choiceOptions.push([
		text,
		link,
		choiceStatus.isRandom,
		currentData.ifCondition,
	]);
}

// Gestion du reste du contenu de la réponse
export function handleRegularContent(line, yaml, currentData) {
	if (line.length > 0 && !isStructureTitle(line, yaml)) {
		// Gestion des liens à l'intérieur du contenu, vers une réponse
		line = line.replaceAll(/\[(.*?)\]\((#.*?)\)/g, '<a href="$2">$1</a>');
		currentData.content.push(line);
		currentData.listParsed = true;
	}
}
