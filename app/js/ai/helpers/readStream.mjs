import { yaml } from "../../markdown/custom/yaml.mjs";
import { hasSentenceEndMark } from "../../utils/strings.mjs";
import { detectApiType } from "./detectApiType.mjs";
import { extractCohereText } from "./cohere.mjs";
import { convertLatexExpressions } from "../../markdown/latex.mjs";
import { markdownToHTML } from "../../markdown/parser.mjs";
import { parseChunkSafely } from "./parseChunks.mjs";

let LLMactive = false;

// Pour simuler le streaming d'un texte complet si la réponse du LLM est envoyée d'un seul coup et non pas streamée.
async function simulateStreaming(fullText, chatMessage, delay = 15) {
	const words = fullText.split(/(\s+)/);
	let accumulatedText = "";

	for (const word of words) {
		accumulatedText += word;
		chatMessage.innerHTML = markdownToHTML(accumulatedText);

		// Conversion LaTeX si activée
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

		// Scroll automatique en bas
		window.scrollTo(0, document.body.scrollHeight);

		// Délai entre chaque mot pour simuler le streaming
		await new Promise((resolve) => setTimeout(resolve, delay));
	}
	return true;
}

// Pour extraire le texte complet d'une réponse d'un LLM non-streamée
function extractFullResponseText(responseData, APItype) {
	if (APItype === "cohere_v1") {
		return responseData.text || "";
	} else if (APItype === "ollama") {
		return responseData.message && responseData.message.content
			? responseData.message.content
			: "";
	} else if (
		APItype === "openai" ||
		APItype === "cohere_v2" ||
		typeof APItype === "undefined"
	) {
		if (responseData.choices) {
			return responseData.choices[0] &&
				responseData.choices[0].message &&
				responseData.choices[0].message.content
				? responseData.choices[0].message.content
				: "";
		}
		if (responseData.message) {
			return responseData.message.content &&
				responseData.message.content[0] &&
				responseData.message.content[0].text
				? responseData.message.content[0].text
				: "";
		}
	}
	return "";
}

// Pour pouvoir lire le stream diffusé par l'API utilisée pour se connecter à une IA
export async function readStreamFromLLM(
	streamableObject,
	chatMessage,
	APItype,
) {
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

			const isStreamMode =
				yaml.useLLM && yaml.useLLM.stream === false ? false : true;
			const shouldSimulateStream =
				yaml.useLLM && yaml.useLLM.simulateStream === true;

			if (!isStreamMode) {
				// MOde non streamé
				// Extraction du texte complet
				const fullResponse = JSON.parse(chunkString);
				const fullText = extractFullResponseText(fullResponse, APItype);

				if (!fullText) {
					console.error("Impossible d'extraire le texte de la réponse");
					return false;
				}
				// Simulation du streaming si activée
				if (shouldSimulateStream) {
					await simulateStreaming(fullText, chatMessage);
				} else {
					// Affichage direct du texte complet
					chatMessage.innerHTML = markdownToHTML(fullText);

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

					window.scrollTo(0, document.body.scrollHeight);
				}

				// Ajout des points de suspension si nécessaire
				const chatMessageLastChild = chatMessage.lastChild;
				if (
					chatMessageLastChild &&
					!hasSentenceEndMark(chatMessageLastChild.innerHTML)
				) {
					chatMessageLastChild.innerHTML =
						chatMessageLastChild.innerHTML + " …";
				}
				LLMactive = false;
				return true;
			}

			const chunkArray = chunkString
				.trim()
				.split("\n")
				.filter((element) => element.trim().length > 0);

			for (const chunkElement of chunkArray) {
				try {
					if (chunkElement.startsWith("event: ")) continue;
					const cleanedChunk = chunkElement.trim().replace(/^data: /, "");
					if (!cleanedChunk.startsWith("{")) continue;

					// Si le type d'API n'est pas encore détecté, on tente de l'inférer
					if (!APItype) {
						APItype = detectApiType(cleanedChunk);
					}
					if (!APItype) continue;
					if (APItype === "openai" || APItype == "cohere_v2") {
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

					if (APItype.includes("cohere")) {
						const cohereAPIversion = APItype.match(/v\d+/)
							? APItype.match(/v\d+/)[0]
							: "";
						let isTextGeneration;
						if (cohereAPIversion == "v1") {
							isTextGeneration = chunkObject.event_type === "text-generation";
						}
						if (cohereAPIversion == "v2") {
							isTextGeneration = chunkObject.delta;
						}
						if (cohereAPIversion && isTextGeneration && LLMactive) {
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
