import { processGoToNextMessage } from "./helpers/processGoToNextMessage.mjs";
import { processBadWords } from "./helpers/processBadWords.mjs";
import { processQuestionToLLM } from "./helpers/processQuestionToLLM.mjs";
import { findBestResponse } from "./helpers/findBestResponse.mjs";

export function getChatbotResponse(chatbot, inputText) {
	// Cas où on doit aller directement vers un nouveau message si on utilise des directives comme !Next
	inputText = processGoToNextMessage(chatbot, inputText);

	// Gestion des insultes
	const responseToBadWords = processBadWords(inputText);
	if (responseToBadWords) return responseToBadWords;

	// Réponse par un LLM
	const answerFromLLM = processQuestionToLLM(chatbot, inputText);
	if (answerFromLLM) return null;

	// Choix de la réponse que le chatbot va envoyer
	const response = findBestResponse(chatbot, inputText);
	return response;
}
