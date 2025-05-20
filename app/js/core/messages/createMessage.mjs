import { displayMessage } from "./displayMessage.mjs";
import { extractMarkdownAndPrompts } from "../../markdown/custom/directives/useLLM/extractMarkdownAndPrompts.mjs";
import { getChatbotResponse } from "../interactions/getChatbotResponse.mjs";
import { processMessageWithPrompt } from "../../markdown/custom/directives/useLLM/processMessageWithPrompt.mjs";
import { createMessageElement } from "./helpers/dom.mjs";
import { processVariables } from "./helpers/processVariables.mjs";
import { processDirectives } from "./helpers/processDirectives.mjs";
import { processPlugins } from "./helpers/processPlugins.mjs";
import { encodeString } from "../../utils/strings.mjs";

function handleBotResponse(chatbot) {
	if (chatbot.nextMessage.selected) {
		return getChatbotResponse(chatbot, chatbot.nextMessage.selected);
	}
}

// Création du message par le bot ou l'utilisateur
export async function createMessage(chatbot, message, options) {
	const originalMessage = message;
	const isUser = options && options.isUser;
	const changeExistingMessage = options && options.changeExistingMessage;
	const disableTypewriter = options && options.disableTypewriter;
	const noMessageMenu = options && options.noMessageMenu;
	let messageElement =
		(options && options.messageElement) || createMessageElement(isUser);

	chatbot.nextMessage.selected = undefined;

	message = await processVariables(chatbot, message, isUser);

	if (!isUser) {
		// Si c'est un message du Bot, on traite les directives et les plugins
		message = processDirectives(chatbot, message, messageElement);
		message = processPlugins(message);
	}

	const checkPromptsinMessage = extractMarkdownAndPrompts(message);
	const hasPromptInmessage = checkPromptsinMessage.useLLM;

	// On affiche un bouton de menu pour chaque message du bot, sauf si on a l'option noMessageMenu, si on est en train de traiter une partie d'un message qui contient un mélange de prompt et de Markdown, ou si le message affiché est le message initial
	if (
		!isUser &&
		!noMessageMenu &&
		!hasPromptInmessage &&
		message != chatbot.initialMessage
	) {
		const actionsHistory = chatbot.actions.join(`|`);
		const messageMenu = `<div class="messageMenu" data-actions-history="${actionsHistory}">☰</div>`;
		message = message ? message + "\n\n" + messageMenu : "";
	}

	if (hasPromptInmessage) {
		// On gère le cas où il y a une partie dans le message qui doit être gérée par un LLM
		const markdownAndPromptSequence = checkPromptsinMessage.sequence;
		await processMessageWithPrompt(
			chatbot,
			markdownAndPromptSequence,
			messageElement,
			isUser,
		);
		// On récupère le contenu de la question posée au LLM et la réponse pour la mettre dans l'historique des actions
		chatbot.actions.pop();
		const llmAnswer = messageElement.innerHTML;
		const llmQuestion = messageElement.previousElementSibling.textContent;
		const llmQuestionEncoded = "llmq:" + encodeString(llmQuestion);
		const llmAnswerEncoded = "llmr:" + encodeString(llmAnswer);
		chatbot.actions.push(llmQuestionEncoded);
		chatbot.actions.push(llmAnswerEncoded);
		const actionsHistory = chatbot.actions.join(`|`);
		// On ajoute le bouton de menu avec l'historique des actions
		const messageMenu = `<div class="messageMenu" data-actions-history="${actionsHistory}">☰</div>`;
		messageElement.innerHTML = llmAnswer + messageMenu;
	} else {
		if (message.trim() !== "") {
			displayMessage(message, {
				isUser: isUser,
				htmlElement: messageElement,
				changeExistingMessage,
				disableTypewriter: disableTypewriter,
				noMessageMenu: noMessageMenu,
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
