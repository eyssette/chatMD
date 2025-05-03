import { yaml } from "../../markdown/custom/yaml.mjs";
import { processMultipleBots } from "../../markdown/custom/directives/bot.mjs";
import { convertLatexExpressions } from "../../../js//markdown/latex.mjs";
import { displayMessage } from "../messages/display.mjs";
import { extractMarkdownAndPrompts } from "../../markdown/custom/directives/useLLM/extractMarkdownAndPrompts.mjs";
import { markdownToHTML } from "../../markdown/parser.mjs";
import { getChatbotResponse } from "../interactions/getChatbotResponse.mjs";
import { processMessageWithPrompt } from "../../markdown/custom/directives/useLLM/processMessageWithPrompt.mjs";
import { createMessageElement } from "./helpers/dom.mjs";
import { processVariables } from "./helpers/processVariables.mjs";
import { processDirectives } from "./helpers/processDirectives.mjs";
import { processPlugins } from "./helpers/processPlugins.mjs";

function handleBotResponse(chatbot) {
	if (chatbot.nextMessage.selected) {
		return getChatbotResponse(chatbot, chatbot.nextMessage.selected);
	}
}

// Création du message par le bot ou l'utilisateur
export function createChatMessage(
	chatbot,
	message,
	isUser,
	chatMessageElement,
) {
	const originalMessage = message;
	let container = chatMessageElement || createMessageElement(isUser);

	chatbot.nextMessage.selected = undefined;

	message = processVariables(chatbot, message, isUser);

	// Cas où c'est un message du bot
	if (!isUser) {
		message = processDirectives(chatbot, message, container);
		message = processPlugins(message);
	}
	const checkPromptsinMessage = extractMarkdownAndPrompts(message);
	const hasPromptInmessage = checkPromptsinMessage.useLLM;

	if (hasPromptInmessage) {
		// On gère le cas où il y a une partie dans le message qui doit être gérée par un LLM
		const markdownAndPromptSequence = checkPromptsinMessage.sequence;
		processMessageWithPrompt(markdownAndPromptSequence, container, isUser);
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
						displayMessage(html, isUser, container).then(() => {
							const response = handleBotResponse(chatbot);
							if (response) {
								createChatMessage(chatbot, response, false);
							}
						});
						// Gestion des éléments HTML <select> si on veut les utiliser pour gérer des variables dynamiques
						message = processSelectElements(
							chatbot,
							message,
							originalMessage,
							container,
						);
					}
				}, 100);
			} else {
				displayMessage(html, isUser, container).then(() => {
					const response = handleBotResponse(chatbot);
					if (response) {
						createChatMessage(chatbot, response, false);
					}
				});
				// Gestion des éléments HTML <select> si on veut les utiliser pour gérer des variables dynamiques
				message = processSelectElements(
					chatbot,
					message,
					originalMessage,
					container,
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
