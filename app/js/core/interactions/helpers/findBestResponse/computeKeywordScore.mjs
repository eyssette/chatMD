import {
	hasLevenshteinDistanceLessThan,
	longestCommonSubstringWeightedLength,
	normalizeText,
} from "../../../../utils/nlp.mjs";

const LEVENSHTEIN_THRESHOLD = 3; // Seuil de similarité (tolérance des fautes d'orthographe et des fautes de frappe)
const WORD_LENGTH_FACTOR = 0.1; // Prise en compte de la taille des keywords (plus les keywords sont grands, plus ils doivent avoir un poids important)

export function computeKeywordScore(userInput, keyword, next, options = {}) {
	let distanceScore = 0;
	let matchScore = 0;
	const MATCH_SCORE_IDENTITY =
		options && options.identity_bonus ? options.identity_bonus : 0;
	// On prend en compte les keywords négatifs (on ne doit pas les voir dans la question de l'utilisateur)
	const isNegativeKeyword = keyword.startsWith("! ");
	keyword = keyword.replace(/^!\s/, "");
	keyword = normalizeText(keyword, { keepCase: true });
	if (userInput.includes(keyword)) {
		// Test de l'identité stricte
		let strictIdentityMatch = false;
		if (next.needsProcessing) {
			// Si on utilise la directive !Next, on vérifie que le keyword n'est pas entouré de lettres ou de chiffres dans le message de l'utilisateur
			const regexStrictIdentityMatch = new RegExp(`\\b${keyword}\\b`);
			if (regexStrictIdentityMatch.test(userInput)) {
				strictIdentityMatch = true;
			}
		} else {
			strictIdentityMatch = true;
		}
		if (strictIdentityMatch) {
			// En cas d'identité stricte, on monte le score d'une valeur définie par MATCH_SCORE_IDENTITY, ou alors on le diminue si on avait un keyword négatif
			matchScore = isNegativeKeyword
				? matchScore - MATCH_SCORE_IDENTITY * 2
				: matchScore + MATCH_SCORE_IDENTITY;
			// On privilégie les correspondances sur les keywords plus longs
			matchScore = isNegativeKeyword
				? matchScore - keyword.length * WORD_LENGTH_FACTOR
				: matchScore + keyword.length * WORD_LENGTH_FACTOR;
		}
	} else if (
		(userInput.length > 5) &
		(keyword.length > 4 && !isNegativeKeyword)
	) {
		// Sinon : test de la similarité (seulement si le message de l'utilisateur n'est pas très court)
		// On calcule la distance de Levenshtein entre le keyword et la question de l'utilisateur (en parcourant les n-grammes du message de l'utilisateur et en prenant en compte la longueur du n-gramme ; avec n = nombre de mots du keyword)
		const levenshteinDistance = hasLevenshteinDistanceLessThan(
			userInput,
			keyword,
			LEVENSHTEIN_THRESHOLD,
			WORD_LENGTH_FACTOR,
		);
		distanceScore =
			levenshteinDistance > 1
				? distanceScore + levenshteinDistance
				: distanceScore;
		if (!next.needsProcessing) {
			// On prend en compte la plus longue chaîne commune de caractères (sauf si on doit passer au message seulement s'il y a présence du keyword [cas d'un quiz] : dans ce cas, on doit être plus strict et tester seulement la proximité avec la distance de Levenshtein pour simplement autoriser quelques fautes d'orthographe)
			distanceScore =
				distanceScore +
				longestCommonSubstringWeightedLength(
					userInput,
					keyword,
					WORD_LENGTH_FACTOR,
				);
		}
	}
	return { matchScore, distanceScore };
}
