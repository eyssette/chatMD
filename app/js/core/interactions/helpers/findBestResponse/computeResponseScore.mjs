import { cosineSimilarity } from "../../../../utils/nlp.mjs";
import { computeKeywordScore } from "./computeKeywordScore.mjs";

const MATCH_SCORE_IDENTITY = 30; // Pour régler le fait de privilégier l'identité d'un keyword à la simple similarité

// Construction de la liste des keywords à tester
function buildKeywordsList(next, response) {
	// Si on a la directive !Next, on inclut seulement les keywords dans la liste des termes à tester (sauf s'il n'y a pas de keyword)
	// Sinon on inclut le titre

	const useOnlyKeywords =
		next.needsProcessing &&
		response.keywords.length > 0 &&
		next.ignoreKeywords !== true;

	// Si on utilise seulement les keywords, on retourne seulement les keywords
	if (useOnlyKeywords) {
		return response.keywords.map((k) => k.toLowerCase());
	}

	// Sinon on ajoute le titre de la réponse à la liste des keywords
	// Ainsi que tous les mots du titre de plus de 4 caractères
	const titleKeywords = response.title
		.replace(/,|\.|:|\?|!|\(|\)|\[|\||\/\]/g, "")
		.replaceAll("/", " ")
		.replaceAll("-", " ")
		.replaceAll("'", " ")
		.replaceAll("’", " ")
		.split(" ")
		.filter((word) => word.length > 4);
	const baseList = useOnlyKeywords
		? response.keywords
		: [...response.keywords, response.title, ...titleKeywords];

	return baseList.map((k) => k.toLowerCase());
}

// Calcul du score de similarité entre le message de l'utilisateur et le contenu de la réponse
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

// Ajustement du score final en fonction des scores de distance, de match, et des directives !Next
function adjustScore(
	response,
	matchScore,
	distanceScore,
	bestDistanceScore,
	next,
	yaml,
) {
	// Si on a un score de distance négatif, c'est qu'il y avait des keywords négatifs : donc le matchscore doit être égal à 0
	if (distanceScore < 0) {
		matchScore = 0;
	}

	// Si on n'a pas eu de matchScore (identité stricte) mais qu'on a un score de distance (similarité) : on l'ajoute au matchScore
	// Sauf si utilise la directive !Next : dans ce cas, on doit absolument avoir un matchScore > 0 (identité stricte) pour passer à la réponse suivante
	if (
		(matchScore == 0 || (yaml && yaml.searchInContent)) &&
		!next.needsProcessing
	) {
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

// Calcul du score total d'une réponse en fonction du message de l'utilisateur et des keywords de la réponse
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

	// On retourne le score final
	matchScore = adjustedScore.matchScore;
	bestDistanceScore = adjustedScore.bestDistanceScore;

	return matchScore;
}
