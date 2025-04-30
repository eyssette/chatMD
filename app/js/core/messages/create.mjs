import {
	nextMessage,
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
import { splitMarkdownAndLLMPrompts } from "../../ai/helpers/extractLLMprompts.mjs";
import { yaml } from "../../markdown/custom/yaml.mjs";
import { getAnswerFromLLM } from "../../ai/api.mjs";
import { markdownToHTML } from "../../markdown/parser.mjs";
import { chatbotResponse } from "../interactions/selectBestResponse.mjs";

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
	nextMessage.selected = undefined;
	// Gestion des variables fixes prédéfinies
	if (yaml.variables) {
		message = processFixedVariables(message);
	}
	if (!isUser) {
		message = processRandomMessage(message);
	}

	if (yaml.dynamicContent) {
		// On traite les variables dynamiques
		message = processDynamicVariables(message, dynamicVariables, isUser);
	}

	// Cas où c'est un message du bot
	if (!isUser) {
		// Gestion de la directive !Bot: botName
		if (yaml.bots) {
			message = processDirectiveBot(message, chatMessage);
		}

		// Gestion de l'audio
		message = processAudio(message);

		// Gestion de la directive !Next: Titre réponse / message si mauvaise réponse
		message = processDirectiveNext(message);

		// Gestion de la directive !SelectNext pour sélectionner aléatoirement le prochain message du chatbot
		message = processDirectiveSelectNext(message);

		// Gestion de schémas et images créés avec mermaid, tikz, graphviz, plantuml …  grâce à Kroki (il faut l'inclure en plugin si on veut l'utiliser)
		if (yaml.plugins && yaml.plugins.includes("kroki")) {
			message = processKroki(message);
		}
	}
	let hasPromptInMessage = false;
	if (yaml.useLLM.url) {
		message = splitMarkdownAndLLMPrompts(message);
		hasPromptInMessage = Array.isArray(message);
	}

	if (hasPromptInMessage) {
		// On gère le cas où il y a une partie dans le message qui doit être gérée par un LLM
		function displayMessageOrGetAnswerFromLLM(
			useLLM,
			content,
			isUser,
			chatMessageElement,
			chatMessage,
		) {
			return new Promise((resolve) => {
				if (useLLM && content.trim() !== "") {
					getAnswerFromLLM(content, "", chatMessageElement, chatMessage).then(
						() => resolve(),
					);
				} else {
					if (yaml.maths === true) {
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
						displayMessage(
							content,
							isUser,
							chatMessageElement,
							chatMessage,
						).then(() => resolve());
					}
				}
			});
		}
		function processMessagesSequentially(parts) {
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
							if (yaml.bots) {
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
		processMessagesSequentially(message);
	} else {
		let html = markdownToHTML(message);
		if (html.trim() !== "") {
			if (yaml.bots) {
				html = processMultipleBots(html);
			}
			if (yaml.maths === true) {
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
							if (nextMessage.selected) {
								chatbotResponse(chatbot, nextMessage.selected);
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
					if (nextMessage.selected) {
						chatbotResponse(chatbot, nextMessage.selected);
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
