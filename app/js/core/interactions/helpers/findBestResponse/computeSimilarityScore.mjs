import { normalizeText } from "../../../../utils/nlp.mjs";
import { computeResponseScore } from "./computeResponseScore.mjs";

export function computeSimilarityScore(chatbot, userInputRaw, yaml) {
	let userInput = normalizeText(userInputRaw);

	let bestMatch = null;
	let bestMatchScore = 0;
	let indexBestMatch;

	const responses = chatbot.responses;
	const next = chatbot.nextMessage;

	// Gestion du cas où il n'y a pas de réponses définies
	const hasNoResponses =
		!responses || responses.length === 0 || !responses[0].title;
	if (hasNoResponses) {
		return { bestMatch, bestMatchScore, indexBestMatch };
	}
	// Parcours de toutes les réponses pour trouver la meilleure correspondance
	for (let i = 0; i < responses.length; i++) {
		const response = responses[i];

		// Si on a la directive !Next ou !SelectNext, on teste seulement la similarité avec la réponse vers laquelle on doit aller et on saute toutes les autres réponses
		if (
			(next.needsProcessing && response.title != next.goto) ||
			(next.selected && response.title != next.selected)
		) {
			continue;
		}

		// Si on a la directive !Next on va directement vers cette réponse, sauf si la réponse contient des déclencheurs (qui vont servir de mots clés pour vérifier la correspondance) et qu'on ne souhaite pas les ignorer
		if (
			next.needsProcessing &&
			response.title == next.goto &&
			(response.keywords.length == 0 || next.ignoreKeywords)
		) {
			userInput = normalizeText(next.goto);
		}

		// Calcul du score de correspondance pour cette réponse
		const matchScore = computeResponseScore({
			chatbot,
			userInput,
			response,
			responseIndex: i,
			yaml,
		});

		if (matchScore > bestMatchScore) {
			bestMatch = response.content ? response.content : null;
			bestMatchScore = matchScore;
			indexBestMatch = i;
		}
	}

	return { bestMatch, bestMatchScore, indexBestMatch };
}
