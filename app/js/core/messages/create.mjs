import {
	processAudio,
	processDirectiveBot,
	processDirectiveNext,
	processDirectiveSelectNext,
	processKroki,
	processMultipleBots,
	processRandomMessage,
} from "../../../js//markdown/custom/directivesAndBlocks.mjs";
import { processFixedVariables } from "../../../js//markdown/custom/variablesFixed.mjs";
import { processDynamicVariables } from "../../../js//markdown/custom/variablesDynamic.mjs";
import { convertLatexExpressions } from "../../../js//markdown/latex.mjs";
import { displayMessage } from "../messages/display.mjs";
import { splitMarkdownAndLLMprompts } from "../../ai/helpers/extractLLMprompts.mjs";
import { yaml } from "../../markdown/custom/yaml.mjs";
import { markdownToHTML } from "../../markdown/parser.mjs";
import { getChatbotResponse } from "../interactions/getChatbotResponse.mjs";
import { processMessageWithPrompt } from "../../markdown/custom/prompts.mjs";

// Création du message par le bot ou l'utilisateur
export function createChatMessage(
	chatbot,
	message,
	isUser,
	chatMessageElement,
) {
	let dynamicVariables = chatbot.dynamicVariables;
	const originalMessage = message;
	let chatMessage;
	if (!chatMessageElement) {
		chatMessage = document.createElement("div");
		chatMessage.classList.add("message");
		chatMessage.classList.add(isUser ? "user-message" : "bot-message");
	} else {
		chatMessage = chatMessageElement;
	}
	chatbot.nextMessage.selected = undefined;
	// Gestion des variables fixes prédéfinies
	if (yaml && yaml.variables) {
		message = processFixedVariables(message);
	}
	if (!isUser) {
		message = processRandomMessage(message);
	}

	if (yaml && yaml.dynamicContent) {
		// On traite les variables dynamiques
		message = processDynamicVariables(
			chatbot,
			message,
			dynamicVariables,
			isUser,
		);
	}

	// Cas où c'est un message du bot
	if (!isUser) {
		// Gestion de la directive !Bot: botName
		if (yaml && yaml.bots) {
			message = processDirectiveBot(message, chatMessage);
		}

		// Gestion de l'audio
		message = processAudio(message);

		// Gestion de la directive !Next: Titre réponse / message si mauvaise réponse
		message = processDirectiveNext(chatbot, message);

		// Gestion de la directive !SelectNext pour sélectionner aléatoirement le prochain message du chatbot
		message = processDirectiveSelectNext(chatbot, message);

		// Gestion de schémas et images créés avec mermaid, tikz, graphviz, plantuml …  grâce à Kroki (il faut l'inclure en plugin si on veut l'utiliser)
		if (yaml && yaml.plugins && yaml.plugins.includes("kroki")) {
			message = processKroki(message);
		}
	}
	let hasPromptInMessage = false;
	if (yaml && yaml.useLLM.url) {
		message = splitMarkdownAndLLMprompts(message);
		hasPromptInMessage = Array.isArray(message);
	}

	if (hasPromptInMessage) {
		// On gère le cas où il y a une partie dans le message qui doit être gérée par un LLM

		processMessageWithPrompt(message, chatMessage, isUser);
	} else {
		let html = markdownToHTML(message);
		if (html.trim() !== "") {
			if (yaml && yaml.bots) {
				html = processMultipleBots(html);
			}
			if (yaml && yaml.maths === true) {
				// S'il y a des maths, on doit gérer le Latex avant d'afficher le message
				// Si le message est celui de l'utilisateur, on n'utilise pas les backticks (car ils ne sont utiles que pour l'effet typewriter qui n'est pas utilisé pour les messages de l'utilisateur)
				let timeToDisplayMessage = false;
				let attempts = 0;
				const interval = setInterval(() => {
					if (window.katex) {
						clearInterval(interval);
						timeToDisplayMessage = true;
						html = isUser
							? convertLatexExpressions(html, true)
							: convertLatexExpressions(html);
					} else {
						attempts++;
						if (attempts > 10) {
							clearInterval(interval);
							timeToDisplayMessage = true;
						}
					}
					if (timeToDisplayMessage) {
						displayMessage(html, isUser, chatMessage).then(() => {
							if (chatbot.nextMessage.selected) {
								const response = getChatbotResponse(
									chatbot,
									chatbot.nextMessage.selected,
								);
								if (response) {
									createChatMessage(chatbot, response, false);
								}
							}
						});
						// Gestion des éléments HTML <select> si on veut les utiliser pour gérer des variables dynamiques
						message = processSelectElements(
							chatbot,
							message,
							originalMessage,
							chatMessage,
						);
					}
				}, 100);
			} else {
				displayMessage(html, isUser, chatMessage).then(() => {
					if (chatbot.nextMessage.selected) {
						const response = getChatbotResponse(
							chatbot,
							chatbot.nextMessage.selected,
						);
						if (response) {
							createChatMessage(chatbot, response, false);
						}
					}
				});
				// Gestion des éléments HTML <select> si on veut les utiliser pour gérer des variables dynamiques
				message = processSelectElements(
					chatbot,
					message,
					originalMessage,
					chatMessage,
				);
			}
		}
	}
}

function processSelectElements(chatbot, message, originalMessage, chatMessage) {
	// Sélectionne tous les éléments <select> de la page
	const allSelectElements = document.querySelectorAll("select");
	// Parcours chaque <select> et ajoute un écouteur d'événement 'change'
	allSelectElements.forEach((selectElement) => {
		const selectedValue = selectElement.getAttribute("data-selected");
		if (selectedValue) {
			const optionToSelect = selectElement.querySelector(
				`option[value="${selectedValue}"]`,
			);
			if (optionToSelect) {
				optionToSelect.selected = true;
			}
		}
		selectElement.addEventListener("change", (event) => {
			const selectedName = event.target.name;
			const selectedValue = event.target.value;
			const regex = new RegExp(`^\`@${selectedName} =.*`, "g");
			message = originalMessage
				.replaceAll(regex, "")
				.replaceAll(/`.*= calc\(@GET.*/g, "");
			message = `\`@${selectedName} = ${selectedValue}\`` + message;
			createChatMessage(chatbot, message, false, chatMessage);
		});
	});
	return message;
}
