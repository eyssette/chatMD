import { displayMessage } from "./displayMessage.mjs";
import { extractMarkdownAndPrompts } from "../../markdown/custom/directives/useLLM/extractMarkdownAndPrompts.mjs";
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
export function createMessage(chatbot, message, options) {
	const originalMessage = message;
	const isUser = options && options.isUser;
	const changeExistingMessage = options && options.changeExistingMessage;
	const disableTypewriter = options && options.disableTypewriter;
	let messageElement =
		(options && options.messageElement) || createMessageElement(isUser);

	chatbot.nextMessage.selected = undefined;

	message = processVariables(chatbot, message, isUser);

	// Cas où c'est un message du bot
	if (!isUser) {
		message = processDirectives(chatbot, message, messageElement);
		message = processPlugins(message);
	}
	const checkPromptsinMessage = extractMarkdownAndPrompts(message);
	const hasPromptInmessage = checkPromptsinMessage.useLLM;

	if (hasPromptInmessage) {
		// On gère le cas où il y a une partie dans le message qui doit être gérée par un LLM
		const markdownAndPromptSequence = checkPromptsinMessage.sequence;
		processMessageWithPrompt(markdownAndPromptSequence, messageElement, isUser);
	} else {
		if (message.trim() !== "") {
			displayMessage(message, {
				isUser: isUser,
				htmlElement: messageElement,
				changeExistingMessage,
				disableTypewriter: disableTypewriter,
			}).then(() => {
				const response = handleBotResponse(chatbot);
				if (response) {
					createMessage(chatbot, response, { isUser: false });
				}
			});
			// Gestion des éléments HTML <select> si on veut les utiliser pour gérer des variables dynamiques
			processSelectElements(chatbot, originalMessage, messageElement);
		}
	}
}

// Pour traiter l'événement 'change' d'un élément <select>, afin de mettre à jour le message concerné en traitant les variables dynamiques contenues dans le message
function processSelectElements(chatbot, originalMessage, htmlElement) {
	// Sélectionne tous les éléments <select> de la page
	const allSelectElements = htmlElement.querySelectorAll("select");
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
			handleChange(event, chatbot, originalMessage, htmlElement);
		});
	});
}

function handleChange(event, chatbot, originalMessage, htmlElement) {
	const selectedName = event.target.name;
	const selectedValue = event.target.value;
	const regex = new RegExp(`^\`@${selectedName} =.*`, "gm");
	let message = originalMessage
		.replaceAll(regex, "")
		.replaceAll(/`.*= calc\(@GET.*/g, "");
	message = `\`@${selectedName} = ${selectedValue}\`\n` + message;
	createMessage(chatbot, message, {
		isUser: false,
		messageElement: htmlElement,
		changeExistingMessage: true,
	});
}
