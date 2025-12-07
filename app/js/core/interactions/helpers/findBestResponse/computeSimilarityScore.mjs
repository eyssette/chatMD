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

	// Gestion des synonymes définis dans le YAML, seulement si on n'a pas la directive !Next ou !SelectNext en cours
	if (yaml && yaml.synonyms && !next.needsProcessing && !next.selected) {
		// Si on a des synonymes définis dans le YAML, on ajoute au message de l'utilisateur les synonymes de chaque mot trouvé dans le message
		// Dans le YAML, les synonymes sont définis sous la forme :
		// synonyms:
		//    - "synonyme A1, synonyme A2, synonyme A3"
		//    - "synonyme B1, synonyme B2, synonyme B3"
		// Ou sous la forme d'une URL pointant vers un fichier texte contenant les synonymes avec ce même format (une liste de synonymes par ligne, chaque synonyme étant séparé par une virgule)
		const synonymsList = yaml.synonyms;

		// On découpe le message en mots en supprimant les signes de ponctuation
		const userWords = userInput
			.replace(/,|\.|:|\?|!|\(|\)|\[|\||\/\]/g, "")
			.replaceAll("/", " ")
			.split(" ");

		// On parcourt chaque mot du message de l'utilisateur
		for (const userWord of userWords) {
			// Pour chaque mot, on parcourt la liste des synonymes pour voir si on trouve une correspondance, et dès qu'on en trouve une on ajoute tous les synonymes au message de l'utilisateur, et on passe au mot suivant
			for (const synonyms of synonymsList) {
				const synonymsArray = synonyms
					.split(",")
					.map((syn) => normalizeText(syn));
				if (synonymsArray.includes(userWord)) {
					// On a trouvé une correspondance, on ajoute tous les synonymes au message de l'utilisateur
					userInput +=
						" " + synonymsArray.filter((syn) => syn !== userWord).join(" ");
					// On passe au mot suivant si on a trouvé une correspondance
					break;
				}
			}
		}
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
