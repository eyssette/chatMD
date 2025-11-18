import { yaml } from "../markdown/custom/yaml.mjs";
import { chatContainer } from "../shared/selectors.mjs";
import { errorMessage } from "./helpers/error.mjs";
import { readStreamFromLLM } from "./helpers/readStream.mjs";
import { encodeString } from "../utils/strings.mjs";

let llmHistory = [];

// Définition du nombre maximum de tokens à conserver dans l'historique des échanges
// Par défaut, on conserve jusqu'à 2000 tokens mis si on a défini un nombre maximum de tokens pour l'historique dans le YAML, on l'utilise
const maxTokensInHistory = yaml.useLLM.maxTokensInHistory || 2000;

// Pour tronquer l'historique des échanges à un nombre maximum de tokens
function truncateHistoryToMaxTokens(history) {
	let totalTokens = 0;
	const truncatedHistory = [];
	// On parcourt l'historique à l'envers pour garder les messages les plus récents
	for (let i = history.length - 1; i >= 0; i--) {
		const message = history[i];
		// On compte le nombre de tokens (approximativement en comptant les mots)
		const messageWords = message.content.split(" ").length;
		const messageTokens = Math.ceil(messageWords * 1.5);
		// Si on n'a pas dépassé la limite, on ajoute le message à l'historique tronqué
		if (totalTokens + messageTokens <= maxTokensInHistory) {
			// On ajoute le message au début de la liste pour conserver l'ordre chronologique
			truncatedHistory.unshift(message);
			totalTokens += messageTokens;
		} else {
			break;
		}
	}
	return truncatedHistory;
}

// Fonction pour récupérer une réponse d'un LLM à partir d'un prompt
export function getAnswerFromLLM(chatbot, userPrompt, options) {
	if (!options.useConversationHistory === true) {
		// On remet l'historique des échanges à zéro si on n'utilise pas l'historique
		llmHistory = [];
	}
	// On limite la taille de l'historique pour éviter d'envoyer trop de données au LLM
	const recentHistory = truncateHistoryToMaxTokens(llmHistory);

	let RAGinformations = options && options.RAG;
	const RAGprompt = options.RAGprompt
		? options.RAGprompt
		: yaml.useLLM.RAGprompt;
	let messageElement = options && options.messageElement;
	let container = options && options.container;
	const inline = options && options.inline;
	return new Promise((resolve) => {
		// Configuration de l'accès au LLM
		let bodyObject = {
			model: yaml.useLLM.model,
			stream: yaml.useLLM.stream === false ? false : true,
			max_tokens: yaml.useLLM.maxTokens,
			frequency_penalty: 0,
			presence_penalty: 0,
			temperature: 0.7,
		};
		if (RAGinformations.length > 0) {
			RAGinformations = RAGprompt + RAGinformations;
		}
		const APIurl = yaml.useLLM.url;
		let APItype;
		const isCohere = yaml && APIurl.includes("cohere");
		if (isCohere) {
			if (APIurl.includes("v1")) {
				APItype = "cohere_v1";
			}
			if (APIurl.includes("v2")) {
				APItype = "cohere_v2";
			}
		}
		const userMessage = options.useConversationHistory
			? userPrompt
			: yaml.useLLM.preprompt +
				userPrompt +
				yaml.useLLM.postprompt +
				RAGinformations;
		if (APItype == "cohere_v1") {
			if (options.useConversationHistory) {
				bodyObject.chat_history = recentHistory.map((item) => {
					return {
						role: item.role == "user" ? "user" : "chatbot",
						message: item.content,
					};
				});
			}
			bodyObject.message = userMessage;
		} else {
			bodyObject.messages = [
				{
					content: yaml.useLLM.systemPrompt,
					role: "system",
				},
				...(options.useConversationHistory ? recentHistory : []),
				{
					content: userMessage,
					role: "user",
				},
			];
		}
		try {
			console.log(bodyObject);
			fetch(APIurl, {
				method: "POST",
				headers: {
					Authorization: "Bearer " + yaml.useLLM.apiKey,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(bodyObject),
			})
				.then((response) => {
					if (!container) {
						container = chatContainer;
					}
					if (response.ok) {
						// Si on n'a pas indiqué d'élément et de container, on met la réponse du LLM dans un nouveau message du chatbot, sinon on utilise l'élément et le container indiqué
						if (!messageElement) {
							messageElement = document.createElement("div");
							messageElement.classList.add("message");
							messageElement.classList.add("bot-message");
						}
						container.appendChild(messageElement);
						readStreamFromLLM(response.body, messageElement, APItype).then(
							() => {
								const llmAnswer = messageElement.innerHTML;
								llmHistory.push({ role: "user", content: userMessage });
								llmHistory.push({ role: "assistant", content: llmAnswer });
								if (!inline) {
									// On récupère le contenu de la question posée au LLM
									let actionsLatest = chatbot.actions.pop();
									if (actionsLatest.startsWith("c:n")) {
										actionsLatest = chatbot.actions.pop();
									}
									actionsLatest = encodeString(
										actionsLatest.replace(/^e:/, ""),
									);
									const actionsHistory = chatbot.actions.join(`|`);
									const actionLlmQuestion = `llmq:${actionsLatest}`;
									// On récupère le contenu de la réponse générée par le LLM
									const actionLlmAnswer = `llmr:${encodeString(llmAnswer)}`;
									// On met cette question et cette réponse dans l'historique des actions
									chatbot.actions.push(actionLlmQuestion);
									chatbot.actions.push(actionLlmAnswer);
									// Et dans le bouton de menu du message
									const actionsPrefix = actionsHistory
										? `${actionsHistory}|`
										: "";
									const messageMenu = `<div class="messageMenu" data-actions-history="${actionsPrefix}${actionLlmQuestion}|${llmAnswer}">☰</div>`;
									const messageMenuElement = document.createElement("div");
									messageMenuElement.innerHTML = messageMenu;
									messageElement.appendChild(messageMenuElement);
								}
								resolve();
							},
						);
					} else {
						errorMessage({ container, inline });
						resolve();
					}
				})
				.catch((error) => {
					errorMessage({ error: error, container: chatContainer });
					resolve();
				});
		} catch (error) {
			errorMessage({ error: error, container: chatContainer });
			resolve();
		}
	});
}
