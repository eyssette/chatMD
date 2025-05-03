import { yaml } from "../markdown/custom/yaml.mjs";
import { chatContainer } from "../shared/selectors.mjs";
import { errorMessage } from "./helpers/error.mjs";
import { readStreamFromLLM } from "./helpers/readStream.mjs";

// Fonction pour récupérer une réponse d'un LLM à partir d'un prompt
export function getAnswerFromLLM(
	userPrompt,
	informations,
	chatMessageElement,
	container,
) {
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
		if (informations.length > 0) {
			informations = yaml.useLLM.RAGprompt + informations;
		}
		const isCohere = yaml && yaml.useLLM.url.includes("cohere");
		const APItype = isCohere ? "cohere" : undefined;

		if (isCohere) {
			bodyObject.message =
				yaml.useLLM.preprompt +
				userPrompt +
				yaml.useLLM.postprompt +
				informations;
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
						informations,
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
					if (response.ok) {
						// Si on n'a pas indiqué d'élément et de container, on met la réponse du LLM dans un nouveau message du chatbot, sinon on utilise l'élément et le container indiqué
						if (!chatMessageElement) {
							chatMessageElement = document.createElement("div");
							chatMessageElement.classList.add("message");
							chatMessageElement.classList.add("bot-message");
						}
						if (!container) {
							container = chatContainer;
						}
						container.appendChild(chatMessageElement);
						readStreamFromLLM(response.body, chatMessageElement, APItype).then(
							() => resolve(),
						);
					} else {
						errorMessage({ container: chatContainer });
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
