import { yaml } from "../markdown/custom/yaml.mjs";
import { chatContainer } from "../shared/selectors.mjs";
import { errorMessage } from "./helpers/error.mjs";
import { readStreamFromLLM } from "./helpers/readStream.mjs";
import { encodeString } from "../utils/strings.mjs";

// Fonction pour récupérer une réponse d'un LLM à partir d'un prompt
export function getAnswerFromLLM(chatbot, userPrompt, options) {
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

		if (APItype == "cohere_v1") {
			bodyObject.message =
				yaml.useLLM.preprompt +
				userPrompt +
				yaml.useLLM.postprompt +
				RAGinformations;
		} else {
			bodyObject.messages = [
				{
					content: yaml.useLLM.systemPrompt,
					role: "system",
				},
				{
					content:
						yaml.useLLM.preprompt +
						userPrompt +
						yaml.useLLM.postprompt +
						RAGinformations,
					role: "user",
				},
			];
		}
		try {
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
									const llmQuestion = `llmq:${actionsLatest}`;
									// On récupère le contenu de la réponse générée par le LLM
									const llmAnswer = `llmr:${encodeString(messageElement.innerHTML)}`;
									// On met cette question et cette réponse dans l'historique des actions
									chatbot.actions.push(llmQuestion);
									chatbot.actions.push(llmAnswer);
									// Et dans le bouton de menu du message
									const actionsPrefix = actionsHistory
										? `${actionsHistory}|`
										: "";
									const messageMenu = `<div class="messageMenu" data-actions-history="${actionsPrefix}${llmQuestion}|${llmAnswer}">☰</div>`;
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
