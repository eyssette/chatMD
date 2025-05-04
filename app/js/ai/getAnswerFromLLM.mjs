import { yaml } from "../markdown/custom/yaml.mjs";
import { chatContainer } from "../shared/selectors.mjs";
import { errorMessage } from "./helpers/error.mjs";
import { readStreamFromLLM } from "./helpers/readStream.mjs";

// Fonction pour récupérer une réponse d'un LLM à partir d'un prompt
export function getAnswerFromLLM(userPrompt, options) {
	let RAGinformations = options && options.RAG;
	let messageElement = options && options.messageElement;
	let container = options && options.container;
	let inline = options && options.inline;
	return new Promise((resolve) => {
		// Configuration de l'accès au LLM
		let bodyObject = {
			model: yaml.useLLM.model,
			stream: true,
			max_tokens: yaml.useLLM.maxTokens,
			frequency_penalty: 0,
			presence_penalty: 0,
			temperature: 0.7,
			top_p: 0.95,
		};
		if (RAGinformations.length > 0) {
			RAGinformations = yaml.useLLM.RAGprompt + RAGinformations;
		}
		const isCohere = yaml && yaml.useLLM.url.includes("cohere");
		const APItype = isCohere ? "cohere" : undefined;

		if (isCohere) {
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
			fetch(yaml.useLLM.url, {
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
						readStreamFromLLM(response.body, messageElement, APItype).then(() =>
							resolve(),
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
