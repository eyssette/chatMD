// Pour tirer au hasard un élément dans un tableau
function getRandomElement(array) {
	return array[Math.floor(Math.random() * array.length)];
}

// Vérifie si une variable texte commence par un élément d'un tableau
function startsWithAnyOf(string, array) {
	for (const element of array) {
		if (string.startsWith(element)) {
			return element;
		}
	}
}

// Une fonction pour ne garder que les éléments avec la valeur la plus grande dans un tableau
function topElements(array, maxElements) {
	let topElements;
	if (array.length < maxElements) {
		// Si le tableau contient moins que maxElements : on garde tout le tableau
		topElements = array.map((element, index) => [element, index]);
	} else {
		// Sinon, on garde seulement les éléments qui ont la valeur la plus grande
		topElements = array.reduce((acc, val, index) => {
			if (acc.length < maxElements) {
				acc.push([val, index]);
				acc.sort((a, b) => a[0] - b[0]);
			} else if (val > acc[0][0]) {
				acc[0] = [val, index];
				acc.sort((a, b) => a[0] - b[0]);
			}
			return acc;
		}, []);
	}
	// Trier par ordre décroissant
	topElements.sort((a, b) => b[0] - a[0]);

	return topElements;
}

// Une fonction pour réordonner de manière aléatoire un tableau
function shuffleArray(array) {
	return array.sort(function () {
		return Math.random() - 0.5;
	});
}

// Une fonction pour mettre de l'aléatoire dans un tableau, en conservant cependant la position de certains éléments
function randomizeArrayWithFixedElements(array) {
	let fixedElements = [];
	let randomizableElements = [];

	// On distingue les éléments fixes et les éléments à ordonner de manière aléatoire
	array.forEach(function (element) {
		if (!element[2]) {
			fixedElements.push(element);
		} else {
			randomizableElements.push(element);
		}
	});

	// On ordonne de manière aléatoire les éléments qui doivent l'être
	randomizableElements = shuffleArray(randomizableElements);

	// On reconstruit le tableau en réinsérant les éléments fixes au bon endroit
	var finalArray = [];
	array.forEach(function (element) {
		if (!element[2]) {
			finalArray.push(element);
		} else {
			finalArray.push(randomizableElements.shift());
		}
	});

	return finalArray;
}

// Une fonction pour tester si le tableau des options doit être réordonné avec de l'aléatoire
function shouldBeRandomized(array) {
	if (Array.isArray(array)) {
		for (let i = 0; i < array.length; i++) {
			if (array[i][2] === true) {
				return true;
			}
		}
	}
	return false;
}

// Pour gérer l'URL de la source du chatbot
function handleURL(url) {
	if (url !== "") {
		let addCorsProxy = true;
		// Vérification de la présence d'un raccourci
		const shortcut = shortcuts.find((element) => element[0] == url);
		if (shortcut) {
			url = shortcut[1];
		}
		// Gestion des fichiers hébergés sur la forge et publiés sur une page web
		if (url.includes(".forge")) {
			addCorsProxy = false;
		}
		// Gestion des fichiers hébergés sur github
		if (url.startsWith("https://github.com")) {
			addCorsProxy = false;
			url = url.replace(
				"https://github.com",
				"https://raw.githubusercontent.com"
			);
			url = url.replace("/blob/", "/");
		}
		// gestion des fichiers hébergés sur codiMD / hedgedoc / digipage
		if (
			url.startsWith("https://codimd") ||
			url.includes("hedgedoc") ||
			url.includes("digipage")
		) {
			addCorsProxy = false;
			url = url
				.replace("?edit", "")
				.replace("?both", "")
				.replace("?view", "")
				.replace(/#$/, "")
				.replace(/\/$/, "");
			url = url.indexOf("download") === -1 ? url + "/download" : url;
		}
		// gestion des fichiers hébergés sur framapad
		if (url.includes("framapad") && !url.endsWith("/export/txt")) {
			url = url.replace(/\?.*/, "") + "/export/txt";
		}
		url = addCorsProxy ? corsProxy + url : url;
	}
	return url;
}

// Pour charger des scripts
function loadScript(src) {
	return new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = src;
		script.onload = resolve;
		script.onerror = reject;
		document.head.appendChild(script);
	});
}

// Pour charger des CSS
function loadCSS(src) {
	return new Promise((resolve, reject) => {
		let styleElement;
		if (src.startsWith("<style>")) {
			styleElement = document.createElement("style");
			styleElement.textContent = src
				.replace("<style>", "")
				.replace("</style>", "");
		} else {
			styleElement = document.createElement("link");
			styleElement.href = src;
			styleElement.rel = "stylesheet";
			styleElement.onload = resolve;
			styleElement.onerror = reject;
		}
		document.head.appendChild(styleElement);
	});
}

// Gestion des variables fixes : soit avant de parser le markdown, soit après
function processVariables(content, preprocess = false) {
	// Les variables fixes qui commencent par _ sont traitées avant de parser le contenu du Markdown
	const regex = preprocess ? /@{(_\S+)}/g : /@{(\S+)}/g;
	return content.replaceAll(
		regex,
		function (match, variableName, positionMatch) {
			const positionLastMatch = content.lastIndexOf(match);
			if (yamlData && yamlData.variables && yamlData.variables[variableName]) {
				const variableValue = yamlData.variables[variableName];
				const variableValueSplit = variableValue.split("///");
				const variableValueChoice = getRandomElement(variableValueSplit);
				if (preprocess && positionMatch == positionLastMatch) {
					// Les variables fixes qui ont été traitées au tout début, avant de parser le contenu du Markdown, sont ensuite supprimés.
					delete yamlData.variables[variableName];
				}
				return variableValueChoice;
			} else {
				return "@{" + variableName + "}";
			}
		}
	);
}

// Gestion du scroll automatique vers le bas
function scrollWindow() {
	setTimeout(() => {
		window.scrollTo(0, document.body.scrollHeight);
	}, 100);
}

// Extensions pour Showdown

// Gestion des admonitions
function showdownExtensionAdmonitions() {
	return [
		{
			type: "output",
			filter: (text) => {
				text = text.replaceAll("<p>:::", ":::");
				const regex = /:::(.*?)\n(.*?):::/gs;
				const matches = text.match(regex);
				if (matches) {
					let modifiedText = text;
					for (const match of matches) {
						const regex2 = /:::(.*?)\s(.*?)\n(.*?):::/s;
						const matchInformations = regex2.exec(match);
						const indexMatch = text.indexOf(match);
						// Pas de transformation de l'admonition en html si l'admonition est dans un bloc code
						const isInCode =
							text.substring(indexMatch - 6, indexMatch) == "<code>"
								? true
								: false;
						if (!isInCode) {
							let type = matchInformations[1];
							let title = matchInformations[2];
							if (type.includes("<br")) {
								type = type.replace("<br", "");
								title = "";
							}
							const content = matchInformations[3];
							if (title.includes("collapsible")) {
								title = title.replace("collapsible", "");
								matchReplaced = `<div><div class="admonition ${type}"><details><summary class="admonitionTitle">${title}</summary><div class="admonitionContent">${content}</div></details></div></div>`;
							} else {
								matchReplaced = `<div><div class="admonition ${type}"><div class="admonitionTitle">${title}</div><div class="admonitionContent">${content}</div></div></div>`;
							}
							modifiedText = modifiedText.replaceAll(match, matchReplaced);
						}
					}
					return modifiedText;
				} else {
					return text;
				}
			},
		},
	];
}

// Gestion du markdown dans les réponses du chatbot
const converter = new showdown.Converter({
	emoji: true,
	parseImgDimensions: true,
	simpleLineBreaks: true,
	simplifiedAutoLink: true,
	tables: true,
	openLinksInNewWindow: true,
	extensions: [showdownExtensionAdmonitions],
});

// Conversion du Markdown en HTML
function markdownToHTML(text) {
	text = text.replaceAll("\n\n|", "|");
	const html = converter.makeHtml(text);
	return html;
}

function convertLatexExpressions(string) {
	string = string
		.replace(/\$\$(.*?)\$\$/g, "&#92;[$1&#92;]")
		.replace(/\$(.*?)\$/g, "&#92;($1&#92;)");
	let expressionsLatex = string.match(
		new RegExp(/&#92;\[.*?&#92;\]|&#92;\(.*?&#92;\)/g)
	);
	if (expressionsLatex) {
		// On n'utilise Katex que s'il y a des expressions en Latex dans le Markdown
		for (let expressionLatex of expressionsLatex) {
			// On vérifie si le mode d'affichage de l'expression (inline ou block)
			const inlineMaths = expressionLatex.includes("&#92;[") ? true : false;
			// On récupère la formule mathématique
			let mathInExpressionLatex = expressionLatex
				.replace("&#92;[", "")
				.replace("&#92;]", "");
			mathInExpressionLatex = mathInExpressionLatex
				.replace("&#92;(", "")
				.replace("&#92;)", "");
			mathInExpressionLatex = mathInExpressionLatex
				.replaceAll("&lt;", "\\lt")
				.replaceAll("&gt;", "\\gt");
			// On convertit la formule mathématique en HTML avec Katex
			stringWithLatex = katex.renderToString(mathInExpressionLatex, {
				displayMode: inlineMaths,
			});
			string = string.replace(expressionLatex, stringWithLatex);
		}
	}
	return string;
}

function levenshteinDistance(a, b) {
	/* Fonction pour calculer une similarité plutôt que d'en rester à une identité stricte */
	if (a.length === 0) return b.length;
	if (b.length === 0) return a.length;

	const matrix = [];
	for (let i = 0; i <= b.length; i++) {
		matrix[i] = [i];
	}

	for (let j = 0; j <= a.length; j++) {
		matrix[0][j] = j;
	}

	for (let i = 1; i <= b.length; i++) {
		for (let j = 1; j <= a.length; j++) {
			const cost = a[j - 1] === b[i - 1] ? 0 : 1;
			matrix[i][j] = Math.min(
				matrix[i - 1][j] + 1,
				matrix[i][j - 1] + 1,
				matrix[i - 1][j - 1] + cost
			);
		}
	}

	return matrix[b.length][a.length];
}

function hasLevenshteinDistanceLessThan(string, keyWord, distance) {
	// Teste la présence d'un mot dans une chaîne de caractère qui a une distance de Levenshstein inférieure à une distance donnée

	const words = string.split(" ");
	// On parcourt les mots

	for (const word of words) {
		// On calcule la distance de Levenshtein entre le mot et le mot cible
		const distanceLevenshtein = levenshteinDistance(word, keyWord);

		// Si la distance est inférieure à la distance donnée, on renvoie vrai
		if (distanceLevenshtein < distance) {
			return true;
		}
	}

	// Si on n'a pas trouvé de mot avec une distance inférieure à la distance donnée, on renvoie faux
	return false;
}

function removeAccents(str) {
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
		(match) => accentMap[match] || match
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

let chatData;
let nextMessage = "";

function tokenize(text, indexChatBotResponse) {
	// Fonction pour diviser une chaîne de caractères en tokens, éventuellement en prenant en compte l'index de la réponse du Chatbot (pour prendre en compte différement les tokens présents dans le titre de la réponse)

	// On garde d'abord seulement les mots d'au moins 5 caractères et on remplace les lettres accentuées par l'équivalent sans accent
	let words = text.toLowerCase();
	words = words.replace(/,|\.|\:|\?|\!|\(|\)|\[|\||\/\]/g, "");
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
	const bonusInTitle = nextMessage ? 100 : 10;

	function weightedToken(index, tokenDimension, word) {
		let weight = weights[tokenDimension - 1]; // Poids en fonction de la taille du token
		weight = index === 0 ? weight + bonusStart : weight; // Bonus si le token est en début du mot
		const token = word.substring(index, index + tokenDimension);
		if (indexChatBotResponse) {
			const titleResponse = chatData[indexChatBotResponse][0].toLowerCase();
			// Bonus si le token est dans le titre
			if (titleResponse.includes(token)) {
				weight = weight + bonusInTitle;
			}
		}
		return { token, weight: weight };
	}

	for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
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

function createVector(text, indexChatBotResponse) {
	// Fonction pour créer un vecteur pour chaque texte en prenant en compte le poids de chaque token et éventuellement l'index de la réponse du chatbot
	const tokens = tokenize(text, indexChatBotResponse);
	const vec = {};
	for (const { token, weight } of tokens) {
		if (token) {
			vec[token] = (vec[token] || 0) + weight;
		}
	}
	return vec;
}

function cosineSimilarity(str, vector) {
	// Calcul de similarité entre une chaîne de caractère (ce sera le message de l'utilisateur) et une autre chaîne de caractère déjà transformée en vecteur (c'est le vecteur de la réponse du chatbot)

	// Crée les vecteurs pour la chaîne de caractère (qui correspondra au message de l'utilisateur)
	const vectorString = createVector(str);

	// Calcule la similarité cosinus
	const dot = dotProduct(vectorString, vector);
	const mag1 = magnitude(vectorString);
	const mag2 = magnitude(vector);

	if (mag1 === 0 || mag2 === 0) {
		return 0; // Évitez la division par zéro
	} else {
		return dot / (mag1 * mag2);
	}
}
