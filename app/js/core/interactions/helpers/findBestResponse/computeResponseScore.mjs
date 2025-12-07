import { cosineSimilarity } from "../../../../utils/nlp.mjs";
import { computeKeywordScore } from "./computeKeywordScore.mjs";

const MATCH_SCORE_IDENTITY = 30; // Pour régler le fait de privilégier l'identité d'un keyword à la simple similarité

function buildKeywordsList(next, response) {
	// Si on a la directive !Next, on inclut seulement les keywords dans la liste des termes à tester (sauf s'il n'y a pas de keyword)
	// Sinon on inclut le titre

	const useOnlyKeywords =
		next.needsProcessing &&
		response.keywords.length > 0 &&
		next.ignoreKeywords !== true;

	const baseList = useOnlyKeywords
		? response.keywords
		: [...response.keywords, response.title];

	return baseList.map((k) => k.toLowerCase());
}

function calculateCosineSimilarityScore(
	chatbot,
	userInput,
	responseIndex,
	next,
) {
	const vectorResponses = chatbot.vectorChatBotResponses;
	const cosSim = cosineSimilarity(userInput, vectorResponses[responseIndex], {
		boostIfKeywordsInTitle: next && next.goto,
	});
	return cosSim ? cosSim + 0.5 : 0;
}

function adjustScore(
	response,
	matchScore,
	distanceScore,
	bestDistanceScore,
	next,
	yaml,
) {
	// si on a un score de distance négatif, c'est qu'il y avait des keywords négatifs : donc le matchscore doit être égal à 0
	if (distanceScore < 0) {
		matchScore = 0;
	}
	if (
		(matchScore == 0 || (yaml && yaml.searchInContent)) &&
		!next.needsProcessing
	) {
		// En cas de simple similarité : on monte quand même le score. Mais si on est dans le mode où on va directement à une réponse en testant la présence de keywords, la correspondance doit être stricte, on ne fait pas de calcul de similarité
		if (distanceScore > bestDistanceScore) {
			matchScore = matchScore + distanceScore;
			bestDistanceScore = distanceScore;
		}
	}
	// Si on a la directive !Next : titre réponse, alors on augmente de manière importante le matchScore si on a un matchScore > 0.5 et que la réponse correspond au titre de la réponse voulue dans la directive
	if (matchScore > 0.5 && next.needsProcessing && response.title == next.goto) {
		matchScore = matchScore + MATCH_SCORE_IDENTITY;
	}
	return { matchScore, bestDistanceScore };
}

export function computeResponseScore({
	chatbot,
	userInput,
	response,
	responseIndex,
	yaml,
}) {
	const next = chatbot.nextMessage;
	const keywords = buildKeywordsList(next, response);

	let bestDistanceScore = 0;
	let matchScore = 0;
	let distanceScore = 0;

	// Si le YAML indique de faire une recherche dans le contenu avec la similarité vectorielle, on prend comme base de score le cosine similarity entre le message de l'utilisateur et le contenu vectoriel de la réponse
	if (yaml && yaml.searchInContent) {
		matchScore = calculateCosineSimilarityScore(
			chatbot,
			userInput,
			responseIndex,
			next,
		);
	}

	// On calcule les scores pour chaque keyword
	for (let keyword of keywords) {
		const keywordScore = computeKeywordScore(userInput, keyword, next, {
			identity_bonus: MATCH_SCORE_IDENTITY,
		});
		matchScore = matchScore + keywordScore.matchScore;
		distanceScore = distanceScore + keywordScore.distanceScore;
	}

	// On ajuste le score
	const adjustedScore = adjustScore(
		response,
		matchScore,
		distanceScore,
		bestDistanceScore,
		next,
		yaml,
	);

	matchScore = adjustedScore.matchScore;
	bestDistanceScore = adjustedScore.bestDistanceScore;

	return matchScore;
}
