import { markdownToHTML } from "../markdown/parser.mjs";
import { yaml } from "../markdown/custom/yaml.mjs";
import { hasSentenceEndMark } from "../utils/strings.mjs";
import { convertLatexExpressions } from "../markdown/latex.mjs";
import { chatContainer } from "../shared/selectors.mjs";

// Fonction pour détecter le type d'API en fonction du contenu
function detectApiType(chunkElement) {
	try {
		const chunkObject = JSON.parse(chunkElement);
		if (chunkObject.message) {
			return "ollama";
		} else if (
			chunkObject.choices &&
			chunkObject.choices[0] &&
			chunkObject.choices[0].delta &&
			chunkObject.choices[0].delta.content
		) {
			return "openai";
		}
	} catch (error) {
		console.warn("Erreur lors de la détection du type d'API :", error);
	}
	return null;
}

let LLMactive = false;

function isJSONComplete(str) {
	try {
		JSON.parse(str);
		return true;
	} catch (error) {
		console.log(error);
		return false;
	}
}

function parseChunkSafely(chunkToParse, incompleteBuffer) {
	incompleteBuffer += chunkToParse;
	if (!isJSONComplete(incompleteBuffer)) {
		return { parsed: null, incompleteChunkBuffer: incompleteBuffer };
	}
	const parsed = JSON.parse(incompleteBuffer);
	incompleteBuffer = "";
	return { parsed: parsed, incompleteChunkBuffer: incompleteBuffer };
}

function extractCohereText(chunkObject, version) {
	switch (version) {
		case "v1":
			return chunkObject.text ? chunkObject.text : "";
		case "v2":
			return chunkObject.message &&
				chunkObject.message.content &&
				chunkObject.message.content[0]
				? chunkObject.message.content[0].text
				: "";
		default:
			throw new Error("Version d'API Cohere non supportée : " + version);
	}
}

// Pour pouvoir lire le stream diffusé par l'API utilisée pour se connecter à une IA
async function readStream(streamableObject, chatMessage, APItype) {
	let incompleteChunkBuffer = "";
	const LLM_MAX_PROCESSING_TIME = yaml.useLLM.maxProcessingTime;
	if (!streamableObject.getReader) {
		throw new TypeError(
			"streamableObject n'est pas une ReadableStream compatible.",
		);
	}
	// Récupération du lecteur de stream
	const reader = streamableObject.getReader();
	let accumulatedChunks = "";
	let done = false;
	const startTime = Date.now();
	while (!done) {
		const elapsedTime = Date.now() - startTime;
		if (elapsedTime >= LLM_MAX_PROCESSING_TIME) {
			console.log("La réponse du LLM a pris plus de temps qu'autorisé");
			LLMactive = false;
			break;
		}
		let value;
		try {
			const result = await reader.read();
			value = result.value;
			done = result.done;
		} catch (error) {
			console.error("Erreur lors de la lecture du flux :", error);
			break;
		}

		if (value) {
			const chunkString = new TextDecoder().decode(value);
			const chunkArray = chunkString
				.trim()
				.split("\n")
				.filter((element) => element.trim().length > 0);

			for (const chunkElement of chunkArray) {
				try {
					const cleanedChunk = chunkElement.trim().replace(/^data: /, "");

					// Si le type d'API n'est pas encore détecté, on tente de l'inférer
					if (!APItype) {
						APItype = detectApiType(cleanedChunk);
					}

					if (APItype === "openai") {
						if (cleanedChunk.indexOf("[DONE]") !== -1) {
							LLMactive = false;
							continue;
						}
					}

					const parsingChunk = parseChunkSafely(
						cleanedChunk,
						incompleteChunkBuffer,
					);
					const chunkObject = parsingChunk.parsed;
					incompleteChunkBuffer = parsingChunk.incompleteChunkBuffer;

					if (!chunkObject) continue;

					if (APItype === "cohere") {
						const cohereAPIversion =
							yaml &&
							yaml.useLLM &&
							yaml.useLLM.url &&
							yaml.useLLM.url.match(/v\d+/)
								? yaml.useLLM.url.match(/v\d+/)[0]
								: "v2";
						if (chunkObject.event_type === "text-generation" && LLMactive) {
							const chunkMessage =
								extractCohereText(chunkObject, cohereAPIversion) || "";
							accumulatedChunks += chunkMessage;
							chatMessage.innerHTML = markdownToHTML(accumulatedChunks);
						}
						LLMactive = !chunkObject.is_finished;
					} else if (APItype === "ollama") {
						// Cas de l'API Ollama
						if (cleanedChunk.indexOf('"done":true') !== -1) {
							LLMactive = false;
							continue;
						}
						if (chunkObject.message && chunkObject.message.content) {
							const chunkMessage = chunkObject.message.content;
							accumulatedChunks += chunkMessage;
							chatMessage.innerHTML = markdownToHTML(accumulatedChunks);
						}
					} else if (APItype === "openai") {
						// Cas du modèle openAI
						const choice = chunkObject.choices && chunkObject.choices[0];
						if (choice && choice.delta && choice.delta.content) {
							const chunkMessage = choice.delta.content;
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
			if (yaml && yaml.maths === true) {
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
						readStream(response.body, chatMessageElement, APItype).then(() =>
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
