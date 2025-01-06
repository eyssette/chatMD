import { chatContainer } from "../chatbot/typewriter";
import { markdownToHTML } from "../processMarkdown/markdownToHTML";
import { yaml } from "../processMarkdown/yaml";
import { hasSentenceEndMark } from "../utils/strings";
import { convertLatexExpressions } from "../processMarkdown/convertLatex";

let LLMactive = false;

// Pour pouvoir lire le stream diffusé par l'API utilisée pour se connecter à une IA
async function readStream(streamableObject, chatMessage, isCohere) {
	if (!streamableObject.getReader) {
		throw new TypeError(
			"streamableObject n'est pas une ReadableStream compatible.",
		);
	}
	// Récupération du lecteur de stream
	const reader = streamableObject.getReader();
	let accumulatedChunks = "";
	let done = false;
	while (!done) {
		let value;
		try {
			const result = await reader.read();
			value = result.value;
			done = result.done;
		} catch (error) {
			console.error("Erreur lors de la lecture du flux :", error);
			break; // Arrête la boucle en cas d'erreur de lecture
		}

		if (value) {
			const chunkString = new TextDecoder().decode(value);
			const chunkArray = chunkString
				.trim()
				.split("\n")
				.filter((element) => element.trim().length > 0);

			for (const chunkElement of chunkArray) {
				try {
					if (isCohere) {
						// Cas de l'API Cohere
						const chunkObject = JSON.parse(chunkElement.trim());
						if (chunkObject.event_type === "text-generation" && LLMactive) {
							const chunkMessage = chunkObject.text || "";
							accumulatedChunks += chunkMessage;
							chatMessage.innerHTML = markdownToHTML(accumulatedChunks);
						}
						LLMactive = chunkObject.is_finished ? false : true;
					} else {
						// Cas des autres API (modèles OpenAI)
						const chunkObjectString = chunkElement.replace("data: ", "").trim();

						// Vérifie si le flux a fini
						if (chunkObjectString.includes("[DONE]")) {
							LLMactive = false;
							continue;
						}

						let chunkObject;
						try {
							chunkObject = JSON.parse(chunkObjectString);
						} catch (jsonError) {
							console.warn(
								"Erreur JSON.parse sur chunkObjectString :",
								chunkObjectString,
								jsonError,
							);
							continue;
						}

						if (chunkObject.choices && chunkObject.choices[0]?.delta?.content) {
							const chunkMessage = chunkObject.choices[0].delta.content || "";
							accumulatedChunks += chunkMessage;
							chatMessage.innerHTML = markdownToHTML(accumulatedChunks);
						}
					}

					// Scroll automatique en bas
					window.scrollTo(0, document.body.scrollHeight);
				} catch (error) {
					console.error("Erreur lors du traitement d'un chunk :", error);
					continue;
				}
			}

			// Si LaTeX est activé, convertit les expressions mathématiques
			if (yaml?.maths === true) {
				try {
					chatMessage.innerHTML = convertLatexExpressions(
						chatMessage.innerHTML,
						true,
					);
				} catch (latexError) {
					console.warn("Erreur lors de la conversion LaTeX :", latexError);
				}
			}
		}
	}
	const chatMessageLastChild = chatMessage.lastChild;
	if (
		chatMessageLastChild &&
		!hasSentenceEndMark(chatMessageLastChild.innerHTML)
	) {
		chatMessageLastChild.innerHTML = chatMessageLastChild.innerHTML + " …";
	}
	return true;
}

// Pour envoyer un message d'erreur si la connexion au LLM n'a pas été correctement configurée ou bien si cette connexion ne fonctionne pas
function messageIfErrorWithGetAnswerFromLLM(error) {
	const errorMessageElement = document.createElement("div");
	errorMessageElement.classList.add("message");
	errorMessageElement.classList.add("bot-message");
	chatContainer.appendChild(errorMessageElement);
	errorMessageElement.textContent =
		"Pour répondre à cette question, je dois faire appel à une IA générative : la connexion à cette IA n'a pas été correctement configurée ou bien ne fonctionne pas";
	if (error) {
		console.error("Erreur:", error.message);
		console.log("Une erreur s'est produite : " + error);
	}
}

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
			// eslint-disable-next-line camelcase
			max_tokens: yaml.useLLM.maxTokens,
			// eslint-disable-next-line camelcase
			frequency_penalty: 0,
			// eslint-disable-next-line camelcase
			presence_penalty: 0,
			temperature: 0.7,
			// eslint-disable-next-line camelcase
			top_p: 0.95,
		};
		if (informations.length > 0) {
			informations = yaml.useLLM.RAGprompt + informations;
		}
		const isCohere = yaml.useLLM.url.includes("cohere");

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
						LLMactive = true;
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
						readStream(response.body, chatMessageElement, isCohere).then(() =>
							resolve(),
						);
					} else {
						messageIfErrorWithGetAnswerFromLLM();
						resolve();
					}
				})
				.catch((error) => {
					messageIfErrorWithGetAnswerFromLLM(error);
					resolve();
				});
		} catch (error) {
			messageIfErrorWithGetAnswerFromLLM(error);
			resolve();
		}
	});
}
