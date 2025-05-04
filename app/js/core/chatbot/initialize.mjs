import { getParamsFromURL } from "../../utils/urls.mjs";
import { markdownToHTML } from "../../markdown/parser.mjs";
import { createVector } from "../../utils/nlp.mjs";
import { processMessageWithChoiceOptions } from "../interactions/helpers/choiceOptions.mjs";
import { createMessage } from "../messages/createMessage.mjs";
import { controlEvents } from "../interactions/controlEvents.mjs";
import { getRAGcontent } from "../../ai/rag/engine.mjs";

export function initializeChatbot(chatbotData, yaml) {
	let dynamicVariables = {};
	// On récupère les paramètres dans l'URL et on les place dans dynamicVariables
	// Si on utilise du contenu dynamique : on pourra utiliser ces variables
	const params = getParamsFromURL();
	for (const [key, value] of Object.entries(params)) {
		dynamicVariables["GET" + key] = value;
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
		optionsLastResponse: null,
		nextMessage: {
			goto: "",
			lastMessageFromBot: "",
			selected: "",
			onlyIfKeywords: false,
			errorsCounter: 0,
			maxErrors: 3,
			messageIfKeywordsNotFound: "",
		},
	};

	const initialMessageContent = initialMessage.content
		.join("\n")
		.replace('<section class="unique">', '<section class="unique" markdown>');
	const initialMessageOptions = initialMessage.choiceOptions;

	// Envoi du message d'accueil du chatbot
	initialMessage = processMessageWithChoiceOptions(
		chatbot,
		initialMessageContent,
		initialMessageOptions,
	);

	createMessage(chatbot, initialMessage, { isUser: false });
	initialMessage = initialMessage
		.replace(/<span class="unique">.*?<\/span>/g, "")
		.replace(/<section class="unique".*?>[\s\S]*?<\/section>/gm, "");
	// S'il y a un élément dans le message initial qui ne doit apparaître que la première fois qu'il est affiché, alors on supprime cet élément pour les prochaines fois
	chatbot.initialMessage = initialMessage;

	controlEvents(chatbot);
}
