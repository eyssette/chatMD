import { yaml } from "../../../../markdown/custom/yaml.mjs";
import {
	hasLevenshteinDistanceLessThan,
	cosineSimilarity,
	longestCommonSubstringWeightedLength,
} from "../../../../utils/nlp.mjs";
import { removeAccents } from "../../../../utils/nlp.mjs";

const LEVENSHTEIN_THRESHOLD = 3; // Seuil de similarité (tolérance des fautes d'orthographe et des fautes de frappe)
const MATCH_SCORE_IDENTITY = 30; // Pour régler le fait de privilégier l'identité d'un keyword à la simple similarité
const WORD_LENGTH_FACTOR = 0.1; // Prise en compte de la taille des keywords (plus les keywords sont grands, plus ils doivent avoir un poids important)

export function computeSimilarityScore(chatbot, userInput) {
	let chatbotResponses = chatbot.responses;
	const chatbotResponsesLength = chatbotResponses.length;
	let bestMatch = null;
	let bestMatchScore = 0;
	let bestDistanceScore = 0;

	let indexBestMatch;

	if (chatbotResponsesLength > 0 && chatbotResponses[0].title) {
		for (let i = 0; i < chatbotResponsesLength; i++) {
			const titleResponse = chatbotResponses[i].title;
			const keywordsResponse = chatbotResponses[i].keywords;
			// Si on a la directive !Next ou !SelectNext, on teste seulement la similarité avec la réponse vers laquelle on doit aller et on saute toutes les autres réponses
			if (
				(chatbot.nextMessage.needsProcessing &&
					titleResponse != chatbot.nextMessage.goto) ||
				(chatbot.nextMessage.selected &&
					titleResponse != chatbot.nextMessage.selected)
			) {
				continue;
			}
			// Si on a la directive !Next on va directement vers cette réponse, sauf si la réponse contient des déclencheurs (qui vont servir de mots clés pour vérifier la correspondance) et qu'on ne souhaite pas les ignorer
			if (
				chatbot.nextMessage.needsProcessing &&
				titleResponse == chatbot.nextMessage.goto &&
				(keywordsResponse.length == 0 || chatbot.nextMessage.ignoreKeywords)
			) {
				userInput = removeAccents(chatbot.nextMessage.goto.toLowerCase());
			}
			// Si on a la directive !Next, alors on ne teste pas la correspondance avec le titre, mais seulement avec les keywords (sauf s'il n'y a pas de keyword)
			// Sinon on inclut le titre
			// On met tout en minuscule
			const keywords =
				chatbot.nextMessage.needsProcessing &&
				keywordsResponse.length > 0 &&
				chatbot.nextMessage.ignoreKeywords !== true
					? keywordsResponse.map((keyword) => keyword.toLowerCase())
					: keywordsResponse
							.concat(titleResponse)
							.map((keyword) => keyword.toLowerCase());
			const responses = chatbotResponses[i];
			let matchScore = 0;
			let distanceScore = 0;
			if (yaml && yaml.searchInContent) {
				const vectorChatBotResponses = chatbot.vectorChatBotResponses;
				const cosSim = cosineSimilarity(userInput, vectorChatBotResponses[i], {
					boostIfKeywordsInTitle:
						chatbot.nextMessage && chatbot.nextMessage.goto,
				});
				matchScore = matchScore + cosSim + 0.5;
			}
			for (let keyword of keywords) {
				// On prend en compte les keywords négatifs (on ne doit pas les voir dans la question de l'utilisateur)
				const isNegativeKeyword = keyword.startsWith("! ");
				keyword = keyword.replace(/^!\s/, "");
				keyword = removeAccents(keyword);
				if (userInput.includes(keyword) && !isNegativeKeyword) {
					// Test de l'identité stricte
					let strictIdentityMatch = false;
					if (chatbot.nextMessage.needsProcessing) {
						// Si on utilise la directive !Next, on vérifie que le keyword n'est pas entouré de lettres ou de chiffres dans le message de l'utilisateur
						const regexStrictIdentityMatch = new RegExp(`\\b${keyword}\\b`);
						if (regexStrictIdentityMatch.test(userInput)) {
							strictIdentityMatch = true;
						}
					} else {
						strictIdentityMatch = true;
					}
					if (strictIdentityMatch) {
						// En cas d'identité stricte, on monte le score d'une valeur plus importante que 1 (définie par MATCH_SCORE_IDENTITY)
						matchScore = matchScore + MATCH_SCORE_IDENTITY;
						// On privilégie les correspondances sur les keywords plus longs
						matchScore = matchScore + keyword.length * WORD_LENGTH_FACTOR;
					}
				} else if (
					(userInput.length > 5) &
					(keyword.length > 4 || isNegativeKeyword)
				) {
					// Sinon : test de la similarité (seulement si le message de l'utilisateur n'est pas très court)
					// On calcule la distance de Levenshtein entre le keyword et la question de l'utilisateur (en parcourant les n-grammes du message de l'utilisateur et en prenant en compte la longueur du n-gramme ; avec n = nombre de mots du keyword)
					const levenshteinDistance = hasLevenshteinDistanceLessThan(
						userInput,
						keyword,
						LEVENSHTEIN_THRESHOLD,
						WORD_LENGTH_FACTOR,
					);
					// Si le keyword est négatif on diminue le score, sinon on l'augmente
					distanceScore = isNegativeKeyword
						? distanceScore - levenshteinDistance
						: levenshteinDistance > 1
							? distanceScore + levenshteinDistance
							: distanceScore;
					if (!isNegativeKeyword && !chatbot.nextMessage.needsProcessing) {
						// Si on n'a pas de keyword négatif on prend en compte la plus longue chaîne commune de caractères (sauf si on doit passer au message seulement s'il y a présence du keyword [cas d'un quiz] : dans ce cas, on doit être plus strict et tester seulement la proximité avec la distance de Levenshtein pour simplement autoriser quelques fautes d'orthographe)
						distanceScore =
							distanceScore +
							longestCommonSubstringWeightedLength(
								userInput,
								keyword,
								WORD_LENGTH_FACTOR,
							);
					}
				}
			}
			// si on a un score de distance négatif, c'est qu'il y avait des keywords négatifs : donc le matchscore doit être égal à 0
			if (distanceScore < 0) {
				matchScore = 0;
			}
			if (
				(matchScore == 0 || yaml.searchInContent) &&
				!chatbot.nextMessage.needsProcessing
			) {
				// En cas de simple similarité : on monte quand même le score. Mais si on est dans le mode où on va directement à une réponse en testant la présence de keywords, la correspondance doit être stricte, on ne fait pas de calcul de similarité
				if (distanceScore > bestDistanceScore) {
					matchScore = matchScore + distanceScore;
					bestDistanceScore = distanceScore;
				}
			}
			// Si on a la directive !Next : titre réponse, alors on augmente de manière importante le matchScore si on a un matchScore > 0.5 et que la réponse correspond au titre de la réponse voulue dans la directive
			if (
				matchScore > 0.5 &&
				chatbot.nextMessage.needsProcessing &&
				titleResponse == chatbot.nextMessage.goto
			) {
				matchScore = matchScore + MATCH_SCORE_IDENTITY;
			}
			if (matchScore > bestMatchScore) {
				bestMatch = responses.content;
				bestMatchScore = matchScore;
				indexBestMatch = i;
			}
		}
	}
	return { bestMatch, bestMatchScore, indexBestMatch };
}
