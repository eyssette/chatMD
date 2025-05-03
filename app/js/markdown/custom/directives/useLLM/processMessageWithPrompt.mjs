import { yaml } from "../../yaml.mjs";
import { getAnswerFromLLM } from "../../../../ai/api.mjs";
import { convertLatexExpressions } from "../../../latex.mjs";
import { displayMessage } from "../../../../core/messages/display.mjs";
import { markdownToHTML } from "../../../parser.mjs";
import { processMultipleBots } from "../bot.mjs";

function displayMessageOrGetAnswerFromLLM(
	useLLM,
	content,
	isUser,
	chatMessageElement,
	chatMessage,
) {
	return new Promise((resolve) => {
		if (useLLM && content.trim() !== "") {
			getAnswerFromLLM(content, "", chatMessageElement, chatMessage).then(() =>
				resolve(),
			);
		} else {
			if (yaml && yaml.maths === true) {
				// S'il y a des maths, on doit gérer le Latex avant d'afficher le message
				let timeToDisplayMessage = false;
				let attempts = 0;
				const interval = setInterval(() => {
					if (window.katex) {
						content = convertLatexExpressions(content);
						timeToDisplayMessage = true;
					} else {
						attempts++;
						if (attempts > 10) {
							timeToDisplayMessage = true;
						}
					}
					if (timeToDisplayMessage) {
						clearInterval(interval);
						displayMessage(
							content,
							isUser,
							chatMessageElement,
							chatMessage,
						).then(() => resolve());
					}
				}, 100);
			} else {
				displayMessage(content, isUser, chatMessageElement, chatMessage).then(
					() => resolve(),
				);
			}
		}
	});
}

export function processMessageWithPrompt(parts, chatMessage, isUser) {
	// On a découpé en parties le message et selon qu'on est dans une partie Markdown ou une partie LLM : on gère le contenu en fonction en enchaînant des Promesses, afin d'attendre que le contenu soit généré jusqu'à la fin pour pouvoir passer à la suite
	return parts
		.reduce((promiseChain, currentPart, index) => {
			const chatMessageElement = document.createElement("div");
			let content;
			let useLLM = false;
			try {
				if (index % 2 == 0) {
					// Gestion du contenu en Markdown
					content = markdownToHTML(currentPart);
					if (yaml && yaml.bots) {
						content = processMultipleBots(content);
					}
				} else {
					// Gestion du contenu qui fait appel à un LLM
					useLLM = true;
					content = currentPart;
				}
			} catch (error) {
				console.error("Erreur lors du traitement de la partie :", error);
				return promiseChain; // Passer à la prochaine partie
			}
			// Pour chaque élément, on ajoute une promesse à la chaîne
			return promiseChain.then(() =>
				displayMessageOrGetAnswerFromLLM(
					useLLM,
					content,
					isUser,
					chatMessageElement,
					chatMessage,
				),
			);
		}, Promise.resolve())
		.catch((error) => {
			console.error(
				"Une erreur s'est produite lors du traitement des messages :",
				error,
			);
		});
}
