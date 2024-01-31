function createChatBot(chatData) {
	const footerElement = document.getElementById('footer')
	const controlsElement = document.getElementById('controls')
	if (yamlFooter === false) {
		footerElement.style.display= "none";
		controlsElement.style.height = "70px";
		const styleControls = "@media screen and (max-width: 500px) { #controls {height:110px!important}}"
		const styleSheet = document.createElement("style")
		styleSheet.innerText = styleControls
		document.head.appendChild(styleSheet);
	}

	const chatbotName = chatData.pop();
	let initialMessage = chatData.pop();
	document.getElementById("chatbot-name").textContent = chatbotName;

	const chatContainer = document.getElementById("chat");
	const userInput = document.getElementById("user-input");
	const sendButton = document.getElementById("send-button");
	let optionsLastResponse = null;
	let randomDefaultMessageIndex = Math.floor(
		Math.random() * defaultMessage.length
	);
	let randomDefaultMessageIndexLastChoice = [];

	// Gestion du markdown dans les réponses du chatbot
	const converter = new showdown.Converter({
		emoji: true,
		parseImgDimensions: true,
		simpleLineBreaks: true,
		simplifiedAutoLink: true,
		tables: true,
		openLinksInNewWindow: true,
	});
	function markdownToHTML(text) {
		text = text.replaceAll('\n\n|','|')
		const html = converter.makeHtml(text);
		return html;
	}

	function getRandomElement(array) {
		return array[Math.floor((Math.random()*array.length))];
	}
	function randomContentMessage(contentMessage) {
		const contentSplitHR = contentMessage.split('<hr />');
		if (contentSplitHR.length>1) {
			contentMessage = getRandomElement(contentSplitHR);
		}
		return contentMessage;
	}
	const conversationElement = document.getElementById("chat");

	// Le focus automatique sur l'userInput est désactivé sur les téléphones mobiles
	const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	const autoFocus = isMobile ? false : true;

	let typed;
	const pauseTypeWriter = "^300 ";
	const stopTypeWriterExecutionTimeThreshold = 800;
	// Effet machine à écrire
	function typeWriter(content, element) {
		// Gestion de "Enter" pour stopper l'effet machine à écrire
		const messageTypeEnterToStopTypeWriter = window.innerWidth > 880 ? "Appuyez sur “Enter” pour stopper l'effet “machine à écrire” et afficher la réponse immédiatement" : "“Enter” pour stopper l'effet “machine à écrire”";
		function stopTypeWriter() {
			typed.stop();
			typed.reset();
			typed.strings = ["`" + content.replace(pauseTypeWriter + "`", "")];
			typed.start();
			typed.destroy();
		}

		function keypressHandler(event) {
			if (event.key === "Enter") {
				stopTypeWriter();
			}
		}		
		// Gestion du scroll automatique vers le bas
		function scrollWindow() {
			window.scrollTo(0, document.body.scrollHeight);
		}
		let counter = 0;
		const start = Date.now();
		function handleMutation(mutationsList) {
			for (const mutation of mutationsList) {
				if (mutation.type === 'childList') {
					// On arrête l'effet “machine à écrire” si le temps d'exécution est trop important
					counter++;
					const executionTime = Date.now() - start;
					if (counter==50 && executionTime > stopTypeWriterExecutionTimeThreshold) {
						stopTypeWriter();
					} 
					// On scrolle automatiquement la fenêtre pour suivre l'affichage du texte
					scrollWindow();
				}
			}
		}

		// Configuration de MutationObserver
		const observerConfig = {
			childList: true,
			subtree: true
		};

		// Gestion du choix d'un message au hasard quand il y a plusieurs réponses possibles
		const optionsStart = content.lastIndexOf('<ul class="messageOptions">');
		if (optionsStart !== -1 && content.endsWith("</a></li>\n</ul>")) {
			let contentMessage = content.substring(0, optionsStart);
			contentMessage = randomContentMessage(contentMessage);
    		const contentOptions = content.substring(optionsStart);
			content = contentMessage + pauseTypeWriter + "`" +contentOptions + "`";
		} else {
			content = randomContentMessage(content);
		}
		// Effet machine à écrire
		typed = new Typed(element, {
			strings: [content],
			typeSpeed: -5000,
			startDelay: 100,
			showCursor: false,
			onBegin: () => {
				// Quand l'effet démarre, on refocalise sur userInput (sauf sur les smartphones)
				if(autoFocus) {userInput.focus();}
				// On détecte un appui sur Enter pour stopper l'effet machine à écrire
				userInput.addEventListener("keypress",keypressHandler);
				userInput.setAttribute("placeholder", messageTypeEnterToStopTypeWriter);
				
				// On détecte le remplissage petit à petit du DOM pour scroller automatiquement la fenêtre vers le bas
				const mutationObserver = new MutationObserver(handleMutation);
				function enableAutoScroll() {
					mutationObserver.observe(conversationElement, observerConfig);
				}
				enableAutoScroll();

				setTimeout(() => {
					// Arrêter le scroll automatique en cas de mouvement de la souris ou de contact avec l'écran
					document.addEventListener('mousemove', function () {
						mutationObserver.disconnect();
					});
					document.addEventListener('wheel', function () {
						// On remet le scroll automatique si on scrolle vers le bas de la page
						if(window.scrollY + window.innerHeight >= document.documentElement.scrollHeight) {
							enableAutoScroll();
						} else {
							mutationObserver.disconnect();
						}
					});
					document.addEventListener('touchstart', function () {
						// On remet le scroll automatique si on scrolle vers le bas de la page
						setTimeout(() => {
							if(window.scrollY + window.innerHeight + 100 >= document.documentElement.scrollHeight) {
								enableAutoScroll();
							} else {
								mutationObserver.disconnect();
							}
					}, 500);
					});
				}, 1000);
				
			},
			onComplete: () => {
				// Quand l'effet s'arrête on supprime la détection du bouton Enter pour stopper l'effet
				userInput.removeEventListener("keypress",keypressHandler);
				if(userInput.getAttribute("placeholder") == messageTypeEnterToStopTypeWriter) {
					userInput.setAttribute("placeholder", "Écrivez votre message");
				}
			}
		});
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
				// On convertit la formule mathématique en HTML avec Katex
				stringWithLatex = katex.renderToString(mathInExpressionLatex, {
					displayMode: inlineMaths,
				});
				string = string.replace(expressionLatex, stringWithLatex);
			}
		}
		return string;
	}

	function processVariables(content) {
		return content.replace(/@{(\S+)}/g, function(match, variableName) {
			if (yamlData.variables[variableName]) {
				return yamlData.variables[variableName];
			} else {
				return "@{"+variableName+"}";
			}
		});
	}

	function displayMessage(html, isUser, chatMessage) {
		// Effet machine à écrire : seulement quand c'est le chatbot qui répond, sinon affichage direct
		// Pas d'effet machine à écrire s'il y a la préférence : "prefers-reduced-motion"
		if (isUser || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			chatMessage.innerHTML = html;
		} else {
			typeWriter(html, chatMessage);
		}
		chatContainer.appendChild(chatMessage);
	}

	// Création du message par le bot ou l'utilisateur
	function createChatMessage(message, isUser) {
		const chatMessage = document.createElement("div");
		chatMessage.classList.add("message");
		chatMessage.classList.add(isUser ? "user-message" : "bot-message");
		let html = markdownToHTML(message);
		html = processVariables(html);
		if (yamlMaths === true) {
			// S'il y a des maths, on doit gérer le Latex avant d'afficher le message
			html = convertLatexExpressions(html);
			setTimeout(() => {
				displayMessage(html, isUser, chatMessage);
			}, 100);
		} else {
			displayMessage(html, isUser, chatMessage);
		}
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

	const LEVENSHTEIN_THRESHOLD = 3; // Seuil de similarité
	const MATCH_SCORE_IDENTITY = 5; // Pour régler le fait de privilégier l'identité d'un mot à la simple similarité
	const BESTMATCH_THRESHOLD = 0.55; // Seuil pour que le bestMatch soit pertinent

	function responseToSelectedOption(optionLink) {
		// Gestion de la réponse à envoyer si on sélectionne une des options proposées
		if (optionLink != "") {
			for (let i = 0; i < chatData.length; i++) {
				const title = chatData[i][0];
				if (optionLink == title) {
					let response = chatData[i][2];
					const options = chatData[i][3];
					response = Array.isArray(response) ? response.join("\n\n") : response;
					optionsLastResponse = options;
					response = gestionOptions(response, options);
					createChatMessage(response, false);
				}
			}
		} else {
			createChatMessage(initialMessage, false);
		}
	}

	function removeAccents(str) {
		const accentMap = {
		  à: 'a',
		  â: 'a',
		  é: 'e',
		  è: 'e',
		  ê: 'e',
		  ë: 'e',
		  î: 'i',
		  ï: 'i',
		  ô: 'o',
		  ö: 'o',
		  û: 'u',
		  ü: 'u',
		  ÿ: 'y',
		  ç: 'c',
		  À: 'A',
		  Â: 'A',
		  É: 'E',
		  È: 'E',
		  Ê: 'E',
		  Ë: 'E',
		  Î: 'I',
		  Ï: 'I',
		  Ô: 'O',
		  Ö: 'O',
		  Û: 'U',
		  Ü: 'U',
		  Ÿ: 'Y',
		  Ç: 'C',
		};
	  
		return str.replace(/[àâéèêëîïôöûüÿçÀÂÉÈÊËÎÏÔÖÛÜŸÇ]/g, (match) => accentMap[match] || match);
	  }

	function tokenize(text, indexChatBotResponse) {
		// Fonction pour diviser une chaîne de caractères en tokens, éventuellement en prenant en compte l'index de la réponse du Chatbot (pour prendre en compte différement les tokens présents dans le titre de la réponse)

		// On garde d'abord seulement les mots d'au moins 5 caractères et on remplace les lettres accentuées par l'équivalent sans accent
		let words = text.toLowerCase();
		words = words.replace(/,|\.|\:|\?|\!|\(|\)|\[|\||\/\]/g,"");
		words = removeAccents(words);
		words = words.split(/\s|'/).filter(word => word.length >= 5) || []; 
		const tokens = [];

		// On va créer des tokens avec à chaque fois un poids associé
		// Plus le token est long, plus le poids du token est important
		const weights = [0, 0, 0, 0, 0.4, 0.6, 0.8];
		// Si le token correspond au début du mot, le poids est plus important
		const bonusStart = 0.2;
		// Si le token est présent dans le titre, le poids est très important
		const bonusInTitle = 10;

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
			return {token, weight: weight};
		}

		for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
			const word = words[wordIndex];
			// Premier type de token : le mot en entier ; poids le plus important
			tokens.push({word, weight: 5});
			// Ensuite on intègre des tokens de 5, 6 et 7 caractères consécutifs pour détecter des racines communes	
			const wordLength = word.length;
			if (wordLength >= 5) {
				for (let i = 0; i <= wordLength - 5; i++) {
					tokens.push(weightedToken(i,5,word));
				}
			}
			if (wordLength >= 6) {
				for (let i = 0; i <= wordLength - 6; i++) {
					tokens.push(weightedToken(i,6,word));
				}
			}
			if (wordLength >= 7) {
				for (let i = 0; i <= wordLength - 7; i++) {
					tokens.push(weightedToken(i,7,word));
				}
			}
		}
		return tokens;
	}

	function createVector(text, indexChatBotResponse) {
		// Fonction pour créer un vecteur pour chaque texte en prenant en compte le poids de chaque token et éventuellement l'index de la réponse du chatbot
		const tokens = tokenize(text, indexChatBotResponse);
		const vec = {};
		for (const {token, weight} of tokens) {
			if (token) {
				vec[token] = (vec[token] || 0) + weight;
			}
		}
		return vec;
	}

	let vectorChatBotResponses = [];
	// On précalcule les vecteurs des réponses du chatbot
	if (yamlSearchInContent) {
		for (let i = 0; i < chatData.length; i++) {
			const responses = chatData[i][2];
			let response = Array.isArray(responses) ? responses.join(" ").toLowerCase() : responses.toLowerCase();
			response = chatData[i][0] + ' ' + response;
			const vectorResponse = createVector(response, i);
			vectorChatBotResponses.push(vectorResponse);
		}
	}

	function cosineSimilarity(str, vector) {
		// Calcul de similarité entre une chaîne de caractère (ce sera le message de l'utilisateur) et une autre chaîne de caractère déjà transformée en vecteur (c'est le vecteur de la réponse du chatbot)
	
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

	function chatbotResponse(userInputText) {
		// Choix de la réponse que le chatbot va envoyer

		if(yamldetectBadWords === true && filterBadWords) {
			if (filterBadWords.check(userInputText)) {
				createChatMessage(getRandomElement(badWordsMessage),false);
				return;
			}
		}

		let bestMatch = null;
		let bestMatchScore = 0;
		let bestDistanceScore = 0;
		let userInputTextToLowerCase = userInputText.toLowerCase();
		let indexBestMatch;

		let optionsLastResponseKeysToLowerCase;
		let indexLastResponseKeyMatch;
		if (optionsLastResponse) {
			// On va comparer le message de l'utilisateur aux dernières options proposées s'il y en a une
			optionsLastResponseKeysToLowerCase = optionsLastResponse.map(
				(element) => {
					return element[0].toLowerCase();
				}
			);
			indexLastResponseKeyMatch = optionsLastResponseKeysToLowerCase.indexOf(
				userInputTextToLowerCase
			);
		}

		if (optionsLastResponse && indexLastResponseKeyMatch > -1) {
			// Si le message de l'utilisateur correspond à une des options proposées, on renvoie directement vers cette option
			const optionLink = optionsLastResponse[indexLastResponseKeyMatch][1];
			responseToSelectedOption(optionLink);
		} else {
			/* Sinon, on cherche la meilleure réponse possible en testant l'identité ou la similarité entre les mots ou expressions clés de chaque réponse possible et le message envoyé */
			for (let i = 0; i < chatData.length; i++) {
				const keywords = chatData[i][1];
				const responses = chatData[i][2];
				let matchScore = 0;
				let distanceScore = 0;
				let distance = 0;
				if (yamlSearchInContent) {
						const cosSim = cosineSimilarity(userInputTextToLowerCase,vectorChatBotResponses[i]);
						matchScore = matchScore + cosSim + 0.5;
				}
				for (let keyword of keywords) {
					let keywordToLowerCase = keyword.toLowerCase();
					if (userInputTextToLowerCase.includes(keywordToLowerCase)) {
						// Test de l'identité stricte
						// En cas d'identité stricte, on monte le score d'une valeur plus importante que 1 (définie par MATCH_SCORE_IDENTITY)
						matchScore = matchScore + MATCH_SCORE_IDENTITY;
						// On privilégie les correspondances sur les keywords plus longs
						matchScore =  matchScore + keywordToLowerCase.length/10;
					} else if (userInputTextToLowerCase.length > 4) {
						// Sinon : test de la similarité (seulement si le message de l'utilisateur n'est pas très court)
						if (hasLevenshteinDistanceLessThan(userInputTextToLowerCase, keyword, LEVENSHTEIN_THRESHOLD)) {	
							distanceScore++;
						}
					}
				}
				if (matchScore == 0) {
					// En cas de simple similarité : on monte quand même le score, mais d'une unité seulement
					if (distanceScore > bestDistanceScore) {
						matchScore++;
						bestDistanceScore = distanceScore;
					}
				}
				if (matchScore > bestMatchScore) {
					bestMatch = responses;
					bestMatchScore = matchScore;
					indexBestMatch = i;
				}
			}
			if (bestMatch && bestMatchScore > BESTMATCH_THRESHOLD) {
				// On envoie le meilleur choix s'il en existe un
				let selectedResponse = Array.isArray(bestMatch) ? bestMatch.join("\n\n") : bestMatch;
				const options = chatData[indexBestMatch][3];
				selectedResponse = gestionOptions(selectedResponse, options);
				createChatMessage(selectedResponse, false);
			} else {
				// En cas de correspondance non trouvée, on envoie un message par défaut (sélectionné au hasard dans la liste définie par defaultMessage)
				// On fait en sorte que le message par défaut envoyé ne soit pas le même que les derniers messages par défaut envoyés
				while (
					randomDefaultMessageIndexLastChoice.includes(
						randomDefaultMessageIndex
					)
				) {
					randomDefaultMessageIndex = Math.floor(
						Math.random() * defaultMessage.length
					);
				}
				if (randomDefaultMessageIndexLastChoice.length > 4) {
					randomDefaultMessageIndexLastChoice.shift();
				}
				randomDefaultMessageIndexLastChoice.push(randomDefaultMessageIndex);
				createChatMessage(defaultMessage[randomDefaultMessageIndex], false);
			}
		}
	}

	function gestionOptions(response, options) {
		if (options) {
			optionsLastResponse = options;
			// Gestion du cas où il y a un choix possible entre différentes options après la réponse du chatbot
			let messageOptions = '\n<ul class="messageOptions">';
			for (let i = 0; i < options.length; i++) {
				const option = options[i];
				const optionText = option[0];
				const optionLink = option[1];
				messageOptions =
					messageOptions +
					'<li><a href="#' +
					optionLink +
					'">' +
					optionText +
					"</a></li>\n";
			}
			messageOptions = messageOptions + "</ul>";
			response = response + messageOptions;
		} else {
			optionsLastResponse = null;
		}
		return response;
	}

	// Gestion des événéments js
	sendButton.addEventListener("click", () => {
		const userInputText = userInput.innerText;
		if (userInputText.trim() !== "") {
			createChatMessage(userInputText, true);
			setTimeout(() => {
				chatbotResponse(userInputText);
				window.scrollTo(0, document.body.scrollHeight);
			}, 100);
			userInput.innerText = "";
		}
	});

	userInput.addEventListener("keypress", (event) => {
		if (event.key === "Enter") {
			event.preventDefault();
			sendButton.click();
			window.scrollTo(0, document.body.scrollHeight);
		}
	});

	document.addEventListener("keypress", (event) => {
		userInput.focus();
	});

	userInput.focus();

	userInput.addEventListener("focus", function () {
		this.classList.remove("placeholder");
	});

	userInput.addEventListener("blur", function () {
		this.classList.add("placeholder");
	});

	chatContainer.addEventListener("click", function (event) {
		const target = event.target;
		if (target.tagName === "A") {
			// Gestion du cas où on clique sur un lien
			const currentUrl = window.location.href;
			const link = target.getAttribute("href");
			if (link.startsWith(currentUrl)) {
				// Si le lien est vers un autre chatbot (avec la même url d'origine), alors on ouvre le chatbot dans un autre onglet
				window.open(link);
			}
			if (link.startsWith("#")) {
				// Si le lien est vers une option, alors on envoie le message correspondant à cette option
				event.preventDefault();
				createChatMessage(target.innerText, true);
				const optionLink = link.substring(1);
				responseToSelectedOption(optionLink);
				window.scrollTo(0, document.body.scrollHeight);
			}
		}
	});

	// Envoi du message d'accueil du chatbot
	initialMessage = gestionOptions(
		initialMessage[0].join("\n"),
		initialMessage[1]
	);
	createChatMessage(initialMessage, false);
	initialMessage = initialMessage.replace(
		/<span class=\"unique\">.*?<\/span>/,
		""
	); // S'il y a un élément dans le message initial qui ne doit apparaître que la première fois qu'il est affiché, alors on supprime cet élément pour les prochaines fois
}
