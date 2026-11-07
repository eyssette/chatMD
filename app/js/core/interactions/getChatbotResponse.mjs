import { processGoToNextMessage } from "./helpers/processGoToNextMessage.mjs";
import { processBadWords } from "./helpers/processBadWords.mjs";
import { processQuestionToLLM } from "./helpers/processQuestionToLLM.mjs";
import { findBestResponse } from "./helpers/findBestResponse.mjs";

export function getChatbotResponse(chatbot, inputText, yaml) {
	// Cas où on doit aller directement vers un nouveau message si on utilise des directives comme !Next
	inputText = processGoToNextMessage(chatbot, inputText);

	// Gestion des insultes
	const responseToBadWords = processBadWords(inputText);
	if (responseToBadWords)
		return {
			response: responseToBadWords,
			stats: {
				type: "bot",
				subtype: "predefined-answer",
				type_details: "response-to-bad-words",
				content: responseToBadWords,
				label: inputText,
			},
		};

	// Réponse par un LLM
	const answerFromLLM = processQuestionToLLM(chatbot, inputText);
	if (answerFromLLM) return null;

	// Choix de la réponse que le chatbot va envoyer
	const { response, stats } = findBestResponse(chatbot, inputText, yaml);
	return { response, stats };
}
