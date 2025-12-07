import { markdownToHTML } from "../../markdown/parser.mjs";
import { precalculateVectorChatbotResponses } from "./helpers/precalculateVectors.mjs";
import { processMessageWithChoiceOptions } from "../interactions/helpers/choiceOptions.mjs";
import { createMessage } from "../messages/createMessage.mjs";
import { controlEvents } from "../interactions/controlEvents.mjs";
import { getRAGcontent } from "../../ai/rag/engine.mjs";
import { processActions } from "./helpers/actions.mjs";

export async function initializeChatbot(chatbotData, yaml, params) {
	let dynamicVariables = {};
	// On place les paramètres de l'URL dans dynamicVariables
	// Si on utilise du contenu dynamique : on pourra utiliser ces variables
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			if (key != "actions" && value) {
				dynamicVariables["GET" + key] = value;
			}
		}
	}

	const chatbotName = chatbotData.title;
	let initialMessage = chatbotData.initialMessage;
	const chatbotNameHTML = markdownToHTML(chatbotName).replace(/<\/?p>/g, "");
	document.getElementById("chatbot-name").innerHTML = chatbotNameHTML;
	document.title = chatbotNameHTML.replace(/<[^>]*>?/gm, "");

	const chatbotResponses = chatbotData.responses;

	const vectorChatBotResponses = precalculateVectorChatbotResponses(
		chatbotResponses,
		yaml,
	);

	let RAG = {};
	if (yaml.useLLM.RAGinformations) {
		const RAGinformations = await getRAGcontent(yaml.useLLM.RAGinformations);
		RAG.content = RAGinformations.content;
		RAG.vector = RAGinformations.vector;
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
		actions: params && params.actions ? params.actions.split("|") : [],
		RAG: RAG,
	};

	controlEvents(chatbot);

	// On récupère le contenu du message initial
	const initialMessageContent = initialMessage.content
		.join("\n\n")
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
	await createMessage(chatbot, initialMessage, {
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
		processActions(chatbot, yaml, hasActions);
	}
	return chatbot;
}
