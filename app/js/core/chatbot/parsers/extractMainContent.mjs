import { startsWithAnyOf } from "../../../utils/strings.mjs";
import { regexOrderedList, regexOrderedListRandom } from "../parseMarkdown.mjs";

const regexDynamicContentIfBlock = /`if (.*?)`/;

export function getMainContentInformations(
	mdWithoutYaml,
	indexEndIntroduction,
	yaml,
) {
	let currentH2Title = null;
	let currentLiItems = [];
	let content = [];
	let lastOrderedList = null;
	let listParsed = false;
	let randomOrder = false;
	const contentAfterFirstPart = mdWithoutYaml.substring(indexEndIntroduction);
	const contentAfterFirstPartLines = contentAfterFirstPart.split("\n");
	let ifCondition = "";
	let chatbotData = [];
	for (let line of contentAfterFirstPartLines) {
		if (startsWithAnyOf(line, yaml.responsesTitles)) {
			// Gestion des identifiants de réponse, et début de traitement du contenu de chaque réponse
			if (currentH2Title) {
				chatbotData.push([
					currentH2Title,
					currentLiItems,
					content,
					lastOrderedList,
				]);
			}
			currentH2Title = line
				.replace(startsWithAnyOf(line, yaml.responsesTitles), "")
				.trim(); // Titre h2
			currentLiItems = [];
			lastOrderedList = null;
			listParsed = false;
			content = [];
		} else if (line.startsWith("- ") && !listParsed) {
			// Gestion des listes
			currentLiItems.push(line.replace("- ", "").trim());
		} else if (yaml.dynamicContent && regexDynamicContentIfBlock.test(line)) {
			ifCondition = line.match(regexDynamicContentIfBlock)[1]
				? line.match(regexDynamicContentIfBlock)[1]
				: "";
			content.push(line + "\n");
			listParsed = true;
		} else if (yaml.dynamicContent && line.includes("`endif`")) {
			ifCondition = "";
			content.push(line + "\n");
			listParsed = true;
		} else if (regexOrderedList.test(line)) {
			// Cas des listes ordonnées
			listParsed = false;
			if (!lastOrderedList) {
				lastOrderedList = [];
			}
			randomOrder = regexOrderedListRandom.test(line);
			const listContent = line.replace(/^\d+(\.|\))\s/, "").trim();
			let link = listContent.replace(/^\[.*?\]\(/, "").replace(/\)$/, "");
			link = yaml.obfuscate ? btoa(link) : link;
			const text = listContent.replace(/\]\(.*/, "").replace(/^\[/, "");
			lastOrderedList.push([text, link, randomOrder, ifCondition]);
			/* lastOrderedList.push(listContent); */
		} else if (line.length > 0 && !line.startsWith("# ")) {
			// Gestion du reste du contenu (sans prendre en compte les éventuels titres 1 dans le contenu)
			// Possibilité de faire des liens à l'intérieur du contenu vers une réponse
			line = line.replaceAll(/\[(.*?)\]\((#.*?)\)/g, '<a href="$2">$1</a>');
			content.push(line);
			listParsed = true;
		}
	}
	chatbotData.push([currentH2Title, currentLiItems, content, lastOrderedList]);
	return chatbotData;
}
