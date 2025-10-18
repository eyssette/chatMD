import { config } from "../../../../config.mjs";
import {
	detectedResponseTitle,
	isStructureTitle,
} from "./detectResponseTitle.mjs";

const regexDynamicContentIfBlock = /`if (.*?)`/;

// Gestion des titres de réponse
export function handleNewResponseTitle(line, yaml, currentData, chatbotData) {
	if (currentData.responseTitle) {
		chatbotData.push({
			title: currentData.responseTitle,
			keywords: currentData.keywords,
			choiceOptions: currentData.choiceOptions,
			content: currentData.content,
		});
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

// Gestion des blocs conditionnels, éventuellement imbriqués
export function handleDynamicContent(line, currentData, yaml) {
	if (!yaml || !yaml.dynamicContent) return false;

	// On initialise la pile si elle n'existe pas
	if (!currentData.conditionStack) {
		currentData.conditionStack = [];
	}

	// Bloc d'ouverture `if`
	if (regexDynamicContentIfBlock.test(line)) {
		const condition =
			(line.match(regexDynamicContentIfBlock) &&
				line.match(regexDynamicContentIfBlock)[1]) ||
			"";

		currentData.conditionStack.push(condition);

		// Combine toutes les conditions avec &&
		currentData.condition = currentData.conditionStack.join(" && ");
		currentData.content.push(line + "\n");
		currentData.listParsed = true;
		return true;
	}

	// Bloc de fermeture `endif`
	if (line.includes("`endif`")) {
		// Retire la condition du niveau d'imbrication actuel
		if (currentData.conditionStack.length > 0) {
			currentData.conditionStack.pop();
		}

		currentData.condition = currentData.conditionStack.join(" && ") || "";
		currentData.content.push(line + "\n");
		currentData.listParsed = true;
		return true;
	}

	return false;
}

// Gestion des éventuelles options de choix proposées en fin de réponse
export function handleChoiceOptions(choiceInformations, yaml, currentData) {
	currentData.listParsed = false;
	if (!currentData.choiceOptions) {
		currentData.choiceOptions = [];
	}
	let link = choiceInformations.url;
	// Compatibilité avec les liens de type ancre
	if (link.startsWith("#")) {
		link = link.slice(1).replaceAll("-", " ");
	}
	link = yaml.obfuscate ? btoa(link) : link;
	let text = choiceInformations.text;
	currentData.choiceOptions.push({
		text: text ? text : config.defaultChoiceOptionText,
		link: link,
		isRandom: choiceInformations.isRandom,
		condition: currentData.condition,
	});
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
