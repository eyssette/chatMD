import { handleURL } from "../utils/urls";
import { startsWithAnyOf } from "../utils/strings";
import { createChatBot } from "../chatbot/createChatbot";
import { processYAML, yaml } from "./yaml";
import { processFixedVariables } from "./processFixedVariables";
import defaultMD from "../../data.md";

let md = defaultMD;
let chatData;

// Pour récupérer le markdown externe via le hash dans l'URL
export function getMarkdownContentandCreateChatbot() {
	// On récupère l'URL du hashtag sans le #
	const url = window.location.hash.substring(1).replace(/\?.*/, "");
	// On traite l'URL pour pouvoir récupérer correctement la source du chatbot
	const sourceChatBot = handleURL(url);
	if (sourceChatBot !== "") {
		if (Array.isArray(sourceChatBot)) {
			// Cas où la source est répartie dans plusieurs fichiers
			const promises = sourceChatBot.map((url) => {
				const processedUrl = handleURL(url);
				return fetch(processedUrl).then((response) => response.text());
			});
			Promise.all(promises)
				.then((data) => {
					md = data.join("\n");
					processYAML(md);
					chatData = parseMarkdown(md);
					createChatBot(chatData);
				})
				.catch((error) => console.error(error));
		} else {
			// Récupération du contenu du fichier
			fetch(sourceChatBot)
				.then((response) => response.text())
				.then((data) => {
					md = data;
					processYAML(md);
					if (yaml && yaml.include) {
						let filesToAdd = yaml.include;
						filesToAdd =
							typeof filesToAdd == "object" ? filesToAdd : { filesToAdd };
						const promises = Object.values(filesToAdd).map((url) => {
							const processedUrl = handleURL(url);
							return fetch(processedUrl).then((response) => {
								if (!response.ok) {
									throw new Error(
										`Erreur lors de la récupération du fichier : ${url}`,
									);
								}
								return response.text();
							});
						});
						Promise.all(promises)
							.then((data) => {
								md = md + "\n\n" + data.join("\n\n");
								chatData = parseMarkdown(md);
								createChatBot(chatData);
							})
							.catch((error) => console.error(error));
					} else {
						chatData = parseMarkdown(md);
						createChatBot(chatData);
					}
				})
				.catch((error) => console.error(error));
		}
	} else {
		processYAML(md);
		chatData = parseMarkdown(md);
		createChatBot(chatData);
	}
}

function parseMarkdown(markdownContent) {
	let chatbotData = [];
	let currentH2Title = null;
	let currentLiItems = [];
	let content = [];
	let lastOrderedList = null;
	const regexOrderedList = /^\d{1,3}(\.|\))\s\[/;
	const regexOrderedListRandom = /^\d{1,3}\)/;
	const regexDynamicContentIfBlock = /`if (.*?)`/;
	let listParsed = false;
	let initialMessageContentArray = [];
	let initialMessageOptions = [];
	let randomOrder = false;

	// On récupère le contenu principal sans l'en-tête YAML s'il existe
	let indexFirstH1title = markdownContent.indexOf("# ");
	const indexFirstH2title = markdownContent.indexOf("## ");
	if (indexFirstH2title > -1 && indexFirstH2title == indexFirstH1title - 1) {
		indexFirstH1title = 0;
	}
	let mainContent = markdownContent.substring(indexFirstH1title);
	if (yaml.variables) {
		mainContent = processFixedVariables(mainContent, true);
	}
	const mainContentWithoutH1 = mainContent.substring(1);
	// On récupère la séparation entre la première partie des données (titre + message principal) et la suite avec les réponses possibles
	const possibleTitles = ["# ", "## ", "### ", "#### ", "##### "];
	const indexOfFirstTitles = possibleTitles
		.map((title) => mainContentWithoutH1.indexOf(title))
		.filter((index) => index > 0);
	const indexAfterFirstMessage = Math.min(...indexOfFirstTitles);

	// Gestion de la première partie des données : titre + message initial
	const firstPart = mainContent.substring(0, indexAfterFirstMessage);
	// Gestion du titre
	const chatbotTitleMatch = firstPart.match(/# .*/);
	const chatbotTitle = chatbotTitleMatch ? chatbotTitleMatch[0] : "Chatbot";
	const chatbotTitleArray = chatbotTitle
		? [chatbotTitle.replace("# ", "").trim()]
		: [""];
	const indexStartTitle = firstPart.indexOf(chatbotTitle);
	// Gestion du message initial
	const initialMessageContent = chatbotTitleMatch
		? firstPart.substring(indexStartTitle + chatbotTitle.length)
		: firstPart.substring(indexStartTitle);
	const initialMessageContentLines = initialMessageContent.split("\n");
	for (let line of initialMessageContentLines) {
		line = line.replace(/^>\s?/, "");
		if (regexOrderedList.test(line)) {
			// Récupération des options dans le message initial, s'il y en a
			randomOrder = regexOrderedListRandom.test(line);
			const listContent = line.replace(/^\d+(\.|\))\s/, "").trim();
			let link = listContent.replace(/^\[.*?\]\(/, "").replace(/\)$/, "");
			link = yaml.obfuscate ? btoa(link) : link;
			const text = listContent.replace(/\]\(.*/, "").replace(/^\[/, "");
			initialMessageOptions.push([text, link, randomOrder]);
		} else {
			initialMessageContentArray.push(line);
		}
	}

	const contentAfterFirstPart = mainContent.substring(indexAfterFirstMessage);
	const contentAfterFirstPartLines = contentAfterFirstPart.split("\n");
	let ifCondition = "";

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

	const initialMessage = [initialMessageContentArray, initialMessageOptions];
	chatbotData.push(initialMessage);
	chatbotData.push(chatbotTitleArray);

	return chatbotData;
}
