import { normalizeText } from "../../../utils/nlp.mjs";
import { matchOptionFromLastResponse } from "./findBestResponse/matchOptionFromLastResponse.mjs";
import { computeSimilarityScore } from "./findBestResponse/computeSimilarityScore.mjs";
import { processFinalResponse } from "./findBestResponse/processFinalResponse.mjs";

export function findBestResponse(chatbot, inputText) {
	let userInput = normalizeText(inputText);

	// On va d'abord comparer le message de l'utilisateur aux derniers choix d'options s'il y en a, et retourner la réponse du chatbot correspondante si c'est le cas
	const matchedOption = matchOptionFromLastResponse(chatbot, userInput);
	if (matchedOption) return matchedOption;

	/* Sinon, on cherche la meilleure réponse possible en testant l'identité ou la similarité entre les mots ou expressions clés de chaque réponse possible et le message envoyé */
	const { bestMatch, bestMatchScore, indexBestMatch } = computeSimilarityScore(
		chatbot,
		userInput,
	);
	return processFinalResponse(
		chatbot,
		userInput,
		bestMatch,
		bestMatchScore,
		indexBestMatch,
	);
}
