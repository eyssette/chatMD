import { markdownToHTML } from "../../markdown/parser.mjs";
import { createVector, removeAccents } from "../../utils/nlp.mjs";
import { processMessageWithChoiceOptions } from "../interactions/helpers/choiceOptions.mjs";
import { createMessage } from "../messages/createMessage.mjs";
import { controlEvents } from "../interactions/controlEvents.mjs";
import { getRAGcontent } from "../../ai/rag/engine.mjs";
import { getChatbotResponse } from "../interactions/getChatbotResponse.mjs";

export function initializeChatbot(chatbotData, yaml, params) {
	let dynamicVariables = {};
	// On place les paramètres de l'URL dans dynamicVariables
	// Si on utilise du contenu dynamique : on pourra utiliser ces variables
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			dynamicVariables["GET" + key] = value;
		}
	}

	const chatbotName = chatbotData.title;
	let initialMessage = chatbotData.initialMessage;
	const chatbotNameHTML = markdownToHTML(chatbotName).replace(/<\/?p>/g, "");
	document.getElementById("chatbot-name").innerHTML = chatbotNameHTML;
	document.title = chatbotNameHTML.replace(/<[^>]*>?/gm, "");

	const chatbotResponses = chatbotData.responses;

	function precalculateVectorChatbotResponses(chatbotResponses) {
		// On précalcule les vecteurs des réponses du chatbot
		let vectorChatBotResponses = [];
		if ((yaml && yaml.searchInContent) || (yaml && yaml.useLLM.url)) {
			for (let i = 0; i < chatbotResponses.length; i++) {
				const responseContent = chatbotResponses[i].content;
				let response = Array.isArray(responseContent)
					? responseContent.join(" ").toLowerCase()
					: responseContent.toLowerCase();
				const titleResponse = chatbotResponses[i].title;
				response = titleResponse + " " + response;
				const vectorResponse = createVector(response, {
					prioritizeTokensInTitle: true,
					titleResponse: titleResponse,
				});
				vectorChatBotResponses.push(vectorResponse);
			}
		}
		return vectorChatBotResponses;
	}

	const vectorChatBotResponses =
		precalculateVectorChatbotResponses(chatbotResponses);

	if (yaml.useLLM.RAGinformations) {
		getRAGcontent(yaml.useLLM.RAGinformations);
	}

	let chatbot = {
		dynamicVariables: dynamicVariables,
		responses: chatbotResponses,
		vectorChatBotResponses: vectorChatBotResponses,
		initialMessage: initialMessage,
		choiceOptionsLastResponse: null,
		nextMessage: {
			goto: "",
			lastMessageFromBot: "",
			selected: "",
			onlyIfKeywords: false,
			errorsCounter: 0,
			maxErrors: 3,
			messageIfKeywordsNotFound: "",
		},
		actions: [],
	};

	controlEvents(chatbot);

	// On récupère le contenu du message initial
	const initialMessageContent = initialMessage.content
		.join("\n")
		.replace('<section class="unique">', '<section class="unique" markdown>');
	const initialMessageChoiceOptions = initialMessage.choiceOptions;

	initialMessage = processMessageWithChoiceOptions(
		chatbot,
		initialMessageContent,
		initialMessageChoiceOptions,
	);
	// On regarde s'il y a des actions à accomplir dans le paramètre de URL "?actions"
	const hasActions = params && params.actions;
	// On affiche le message d'accueil, sans typewriter s'il y a des actions à accomplir, et sans menu de message
	createMessage(chatbot, initialMessage, {
		isUser: false,
		disableTypewriter: hasActions,
		noMessageMenu: true,
	});
	// S'il y a un élément dans le message initial qui ne doit apparaître que la première fois qu'il est affiché, alors on supprime cet élément pour les prochaines fois
	initialMessage = initialMessage
		.replace(/<span class="unique">.*?<\/span>/g, "")
		.replace(/<section class="unique".*?>[\s\S]*?<\/section>/gm, "");
	chatbot.initialMessage = initialMessage;

	// S'il y a des actions à accomplir …
	if (hasActions) {
		const actions = hasActions.split("|");
		// Pour chaque action …
		actions.forEach((action, index) => {
			// On récupère les informations  de l'action (type et données)
			const separator = action.indexOf(":");
			const actionType = action.slice(0, separator);
			const actionData = action.slice(separator + 1).trim();
			const isLast = index === actions.length - 1;

			// Si l'action consiste à entrer un message dans la zone de texte
			if (actionType == "e") {
				// On affiche ce message
				const userMessage = actionData;
				createMessage(chatbot, userMessage, { isUser: true });
				// Puis on affiche la réponse, sans typewriter sauf si on en est à la dernière action
				const response = getChatbotResponse(chatbot, userMessage);
				if (response) {
					createMessage(chatbot, response, {
						isUser: false,
						disableTypewriter: !isLast,
					});
				}
			}

			// Si l'action consiste à cliquer sur un bouton de réponse
			if (actionType == "c") {
				// On récupère les boutons de réponse
				const choiceOptions = document.querySelectorAll(".messageOptions li a");
				let choiceArray = Array.from(choiceOptions);
				const selectChoiceOptionByPosition = /^n\d+$/.test(actionData);
				let selectedChoiceOption;
				if (selectChoiceOptionByPosition) {
					// Première possibilité : on identifie un bouton de réponse par son numéro parmi l'ensemble des boutons de réponse affichées
					const choiceOptionPosition = actionData.replace("n", "");
					selectedChoiceOption = choiceArray[choiceOptionPosition - 1];
				} else {
					// Deuxième possibilité : on identifie un bouton de réponse, en cherchant le bouton de réponse, en partant des derniers, qui contient le contenu d'un texte à chercher
					// On met la liste dans le sens inverse pour pouvoir chercher en premier dans les dernières options affichées
					choiceArray = choiceArray.reverse();
					// On fait la recherche sans prendre en compte les accents et les majuscules
					const actionDataNormalized = removeAccents(actionData.toLowerCase());
					selectedChoiceOption = choiceArray.find((option) =>
						removeAccents(option.innerHTML.toLowerCase()).includes(
							actionDataNormalized,
						),
					);
				}

				// Si on a trouvé un bouton de réponse qui correspond
				if (selectedChoiceOption) {
					// On récupère le message à afficher
					const messageToDisplay = selectedChoiceOption.innerHTML;
					// Et le message à envoyer au chatbot
					const messageToChatbot = selectedChoiceOption
						.getAttribute("href")
						.replace("#", "");
					// On affiche le message à afficher côté utilisateur
					createMessage(chatbot, messageToDisplay, { isUser: true });
					// On récupère puis affiche la répones du chatbot
					const response = getChatbotResponse(chatbot, messageToChatbot);
					if (response) {
						createMessage(chatbot, response, {
							isUser: false,
							disableTypewriter: !isLast,
						});
					}
				}
			}
		});
	}
}
