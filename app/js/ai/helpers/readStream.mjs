import { yaml } from "../../markdown/custom/yaml.mjs";
import { hasSentenceEndMark } from "../../utils/strings.mjs";
import { detectApiType } from "./detectApiType.mjs";
import { extractCohereText } from "./cohere.mjs";
import { convertLatexExpressions } from "../../markdown/latex.mjs";
import { markdownToHTML } from "../../markdown/parser.mjs";
import { parseChunkSafely } from "./parseChunks.mjs";

let LLMactive = false;

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
			const chunkArray = chunkString
				.trim()
				.split("\n")
				.filter((element) => element.trim().length > 0);

			for (const chunkElement of chunkArray) {
				try {
					if (chunkElement.startsWith("event: ")) continue;
					const cleanedChunk = chunkElement.trim().replace(/^data: /, "");

					// Si le type d'API n'est pas encore détecté, on tente de l'inférer
					if (!APItype) {
						APItype = detectApiType(cleanedChunk);
					}
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
