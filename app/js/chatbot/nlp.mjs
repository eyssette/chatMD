import { nextMessage } from "../processMarkdown/directivesAndSpecialContents";

export function longestCommonSubstringWeightedLength(
	userInput,
	keyword,
	wordLengthFactor,
) {
	let longestCommonSubstring = "";
	let longestCommonSubstringWeightedLength = 0;
	const positionDecayFactor = 10; // Coefficient d'importance pour la position

	for (let i = 0; i < userInput.length; i++) {
		for (let j = 0; j < keyword.length; j++) {
			let substringWeightedLength = 0;
			let substring = "";
			let substringLength = 0;
			let x = i;
			let y = j;
			while (
				x < userInput.length &&
				y < keyword.length &&
				userInput[x] === keyword[y]
			) {
				substring += userInput[x];
				x++;
				y++;

				// On calcule un poids en fonction de deux paramètres :
				// 1) Prise en compte de la position de la substring dans le keyword : plus la substring est au début du keyword, plus le poids est important
				// Idée = début d'un mot souvent plus important pour la signification que la fin
				const positionDecay = j / keyword.length;
				substringLength = substring.length;
				const positionFactor = 1 / (1 + positionDecay * positionDecayFactor);
				// 2) Prise en compte de la longueur de la substring : plus la substring est longue par rapport à la longueur initial du keyword, plus le poids est important
				const lengthFactor = 1 / (1 + 1 * (keyword.length - substringLength));
				// Calcul du poids final
				const positionWeight = positionFactor * lengthFactor;

				// Prise en compte d'une constante qui donne plus ou moins de poids à la longueur des keywords
				substringWeightedLength =
					(substringLength + substringLength * wordLengthFactor) *
					positionWeight;
			}

			if (
				substringLength > 4 &&
				substringLength > longestCommonSubstring.length
			) {
				longestCommonSubstring = substring;
				longestCommonSubstringWeightedLength = substringWeightedLength;
			}
		}
	}
	return longestCommonSubstringWeightedLength;
}

function levenshteinDistance(a, b) {
	/* Fonction pour calculer une similarité plutôt que d'en rester à une identité stricte */
	const aLength = a.length;
	const bLength = b.length;
	if (aLength === 0) return bLength;
	if (bLength === 0) return aLength;

	const matrix = [];
	for (let i = 0; i <= bLength; i++) {
		matrix[i] = [i];
	}

	for (let j = 0; j <= aLength; j++) {
		matrix[0][j] = j;
	}

	for (let i = 1; i <= bLength; i++) {
		for (let j = 1; j <= aLength; j++) {
			const cost = a[j - 1] === b[i - 1] ? 0 : 1;
			matrix[i][j] = Math.min(
				matrix[i - 1][j] + 1,
				matrix[i][j - 1] + 1,
				matrix[i - 1][j - 1] + cost,
			);
		}
	}

	return matrix[bLength][aLength];
}

export function hasLevenshteinDistanceLessThan(
	string,
	keyWord,
	distance,
	WORD_LENGTH_FACTOR,
) {
	let similarity = 0;
	// Divise keyWord en mots pour déterminer la longueur des n-grammes
	const keyWordWords = keyWord.split(" ");
	const n = keyWordWords.length;
	// Divise la chaîne en un tableau de mots
	const words = string.split(" ");

	// Parcours les n-grammes de taille n dans la chaîne
	for (let i = 0; i <= words.length - n; i++) {
		// Crée un n-gramme à partir de la sous-séquence des mots
		const nGram = words.slice(i, i + n).join(" ");
		// Calcule la distance de Levenshtein entre le n-gramme et keyWord
		const distanceLevenshtein = levenshteinDistance(nGram, keyWord);

		// Si la distance est inférieure à la distance donnée, on augmente le score de similarité en fonction de la taille du n-gramme
		if (distanceLevenshtein < distance) {
			similarity = similarity + nGram.length * WORD_LENGTH_FACTOR * 3;
		}
	}
	return similarity;
}

export function removeAccents(str) {
	const accentMap = {
		à: "a",
		â: "a",
		é: "e",
		è: "e",
		ê: "e",
		ë: "e",
		î: "i",
		ï: "i",
		ô: "o",
		ö: "o",
		û: "u",
		ü: "u",
		ÿ: "y",
		ç: "c",
		À: "A",
		Â: "A",
		É: "E",
		È: "E",
		Ê: "E",
		Ë: "E",
		Î: "I",
		Ï: "I",
		Ô: "O",
		Ö: "O",
		Û: "U",
		Ü: "U",
		Ÿ: "Y",
		Ç: "C",
	};

	return str.replace(
		/[àâéèêëîïôöûüÿçÀÂÉÈÊËÎÏÔÖÛÜŸÇ]/g,
		(match) => accentMap[match] || match,
	);
}

// Calcule le produit scalaire de deux vecteurs
function dotProduct(vec1, vec2) {
	const commonWords = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
	let dot = 0;
	for (const word of commonWords) {
		dot += (vec1[word] || 0) * (vec2[word] || 0);
	}
	return dot;
}

// Calcule la magnitude d'un vecteur
function magnitude(vec) {
	let sum = 0;
	for (const word in vec) {
		sum += vec[word] ** 2;
	}
	return Math.sqrt(sum);
}

function tokenize(text, titleResponse) {
	// Fonction pour diviser une chaîne de caractères en tokens, éventuellement en prenant en compte l'index de la réponse du Chatbot (pour prendre en compte différement les tokens présents dans le titre de la réponse)

	// On garde d'abord seulement les mots d'au moins 5 caractères et on remplace les lettres accentuées par l'équivalent sans accent
	let words = text.toLowerCase();
	words = words.replace(/,|\.|:|\?|!|\(|\)|\[|\||\/\]/g, "");
	words = words.replaceAll("/", " ");
	words = removeAccents(words);
	words =
		words
			.split(/\s|'/)
			.map((word) => word.trim())
			.filter((word) => word.length >= 5) || [];
	const tokens = [];

	// On va créer des tokens avec à chaque fois un poids associé
	// Plus le token est long, plus le poids du token est important
	const weights = [0, 0, 0, 0, 0.4, 0.6, 0.8];
	// Si le token correspond au début du mot, le poids est plus important
	const bonusStart = 0.2;
	// Si le token est présent dans le titre, le poids est très important
	const bonusInTitle = nextMessage.goto ? 100 : 10;
	// Si le nombre de caractères du token est proche du nombre de caractères du mot de base, alors le poids est plus important
	const bonusLengthSimilarity = 5;

	function weightedToken(index, tokenDimension, word) {
		let weight = weights[tokenDimension - 1]; // Poids en fonction de la taille du token
		weight = index === 0 ? weight + bonusStart : weight; // Bonus si le token est en début du mot
		// Bonus si le token est proche en nombre de mots, du mot de base
		const lengthDifference = word.length - tokenDimension;
		weight =
			lengthDifference > 0
				? weight + bonusLengthSimilarity / lengthDifference
				: weight;
		const token = word.substring(index, index + tokenDimension);
		if (titleResponse) {
			titleResponse = titleResponse.toLowerCase();
			// Bonus si le token est dans le titre
			if (titleResponse.includes(token)) {
				weight = weight + bonusInTitle;
			}
		}
		return { token, weight: weight };
	}

	const wordsLength = words.length;
	for (let wordIndex = 0; wordIndex < wordsLength; wordIndex++) {
		const word = words[wordIndex];
		// Premier type de token : le mot en entier ; poids le plus important
		tokens.push({ token: word, weight: 5 });
		// Ensuite on intègre des tokens de 5, 6 et 7 caractères consécutifs pour détecter des racines communes
		const wordLength = word.length;
		if (wordLength >= 5) {
			for (let i = 0; i <= wordLength - 5; i++) {
				tokens.push(weightedToken(i, 5, word));
			}
		}
		if (wordLength >= 6) {
			for (let i = 0; i <= wordLength - 6; i++) {
				tokens.push(weightedToken(i, 6, word));
			}
		}
		if (wordLength >= 7) {
			for (let i = 0; i <= wordLength - 7; i++) {
				tokens.push(weightedToken(i, 7, word));
			}
		}
	}
	return tokens;
}

export function createVector(text, titleResponse) {
	// Fonction pour créer un vecteur pour chaque texte en prenant en compte le poids de chaque token et éventuellement l'index de la réponse du chatbot
	const tokens = tokenize(text, titleResponse);
	const vec = {};
	for (const { token, weight } of tokens) {
		if (token) {
			vec[token] = (vec[token] || 0) + weight;
		}
	}
	return vec;
}

export function cosineSimilarity(str, vector) {
	// Calcul de similarité entre une chaîne de caractère (ce sera le message de l'utilisateur) et une autre chaîne de caractère déjà transformée en vecteur (c'est le vecteur de la réponse du chatbot)

	// Crée les vecteurs pour la chaîne de caractère (qui correspondra au message de l'utilisateur)
	const vectorString = createVector(str);

	// Calcule la similarité cosinus
	const dot = dotProduct(vectorString, vector);
	const mag1 = magnitude(vectorString);
	const mag2 = magnitude(vector);

	if (mag1 === 0 || mag2 === 0) {
		return 0; // Évite la division par zéro
	} else {
		return dot / (mag1 * mag2);
	}
}
