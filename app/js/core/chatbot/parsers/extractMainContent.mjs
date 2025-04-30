import { detectChoiceOption } from "./detectChoiceOption.mjs";
import {
	detectedResponseTitle,
	isStructureTitle,
} from "./detectResponseTitle.mjs";

const regexDynamicContentIfBlock = /`if (.*?)`/;

export function getMainContentInformations(
	mdWithoutYaml,
	indexEndIntroduction,
	yaml,
) {
	let currentResponseTitle = null;
	let currentLiItems = [];
	let content = [];
	let lastOrderedList = null;
	let listParsed = false;
	const contentAfterFirstPart = mdWithoutYaml.substring(indexEndIntroduction);
	const contentAfterFirstPartLines = contentAfterFirstPart.split("\n");
	let ifCondition = "";
	let chatbotData = [];
	for (let line of contentAfterFirstPartLines) {
		const choiceStatus = detectChoiceOption(line);
		if (detectedResponseTitle(line, yaml)) {
			// Gestion des identifiants de réponse, et début de traitement du contenu de chaque réponse
			if (currentResponseTitle) {
				chatbotData.push([
					currentResponseTitle,
					currentLiItems,
					content,
					lastOrderedList,
				]);
			}
			currentResponseTitle = line
				.replace(detectedResponseTitle(line, yaml), "")
				.trim();
			currentLiItems = [];
			lastOrderedList = null;
			listParsed = false;
			content = [];
		} else if (line.startsWith("- ") && !listParsed) {
			// Gestion des listes
			currentLiItems.push(line.replace("- ", "").trim());
		} else if (yaml.dynamicContent && regexDynamicContentIfBlock.test(line)) {
			// Cas des blocs dynamiques conditionnels
			ifCondition = line.match(regexDynamicContentIfBlock)[1]
				? line.match(regexDynamicContentIfBlock)[1]
				: "";
			content.push(line + "\n");
			listParsed = true;
		} else if (yaml.dynamicContent && line.includes("`endif`")) {
			ifCondition = "";
			content.push(line + "\n");
			listParsed = true;
		} else if (choiceStatus.isChoice) {
			// Cas des listes ordonnées
			listParsed = false;
			if (!lastOrderedList) {
				lastOrderedList = [];
			}
			const listContent = line.replace(/^\d+(\.|\))\s/, "").trim();
			let link = listContent.replace(/^\[.*?\]\(/, "").replace(/\)$/, "");
			link = yaml.obfuscate ? btoa(link) : link;
			const text = listContent.replace(/\]\(.*/, "").replace(/^\[/, "");
			lastOrderedList.push([text, link, choiceStatus.isRandom, ifCondition]);
		} else if (line.length > 0 && !isStructureTitle(line, yaml)) {
			// Gestion du reste du contenu de la réponse

			// Pour définir le contenu d'une réponse, le chatbot ne prend pas en compte les lignes qui contiennent un titre qui sert simplent à structurer le chatbot (pour le créateur, sans affichage dans le chatbot côté utilisateur)

			// Possibilité de faire des liens à l'intérieur du contenu vers une réponse
			line = line.replaceAll(/\[(.*?)\]\((#.*?)\)/g, '<a href="$2">$1</a>');
			content.push(line);
			listParsed = true;
		}
	}
	chatbotData.push([
		currentResponseTitle,
		currentLiItems,
		content,
		lastOrderedList,
	]);
	return chatbotData;
}
