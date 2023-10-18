function createChatBot(chatData) {
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
	var converter = new showdown.Converter({
		emoji: true,
		parseImgDimensions: true,
	});
	function markdownToHTML(text) {
		const html = converter.makeHtml(text);
		return html;
	}

	// Effet machine à écrire
	function typeWriter(content, element) {
		var typewriter = new Typewriter(element, {
			loop: false,
			delay: 10,
		});
		typewriter
			.typeString(content)
			.start()
			.callFunction(() => {
				userInput.focus();
			});
	}

	// Création du message par le bot ou l'utilisateur
	function createChatMessage(message, isUser) {
		const chatMessage = document.createElement("div");
		chatMessage.classList.add("message");
		chatMessage.classList.add(isUser ? "user-message" : "bot-message");
		const html = markdownToHTML(message);
		// Effet machine à écrire : pas quand il s'agit d'un message de l'utilisateur, seulement quand c'est le chatbot qui répond
		if (isUser) {
			chatMessage.innerHTML = html;
		} else {
			typeWriter(html, chatMessage);
		}
		chatContainer.appendChild(chatMessage);
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

	const LEVENSHTEIN_THRESHOLD = 5; // Seuil de similarité
	const MATCH_SCORE_IDENTITY = 5; // Pour régler le fait de privilégier l'identité d'un mot à la simple similarité

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

	function cosineSimilarity(str1, str2) {
		function tokenize(text) {
		// Fonction pour diviser une chaîne de caractères en tokens
		const words = text.toLowerCase().split(/\s|'|,|\.|\:|\?|\!|\(|\)|\[|\]/).filter(word => word.length >= 5) || []; // On garde d'abord seulement les mots d'au moins 5 caractères
		const tokens = [];

		// On va créer des tokens avec à chaque fois un poids associés
		for (const word of words) {
			// Premier type de token : le mot en entier ; poids le plus important
			tokens.push({word, weight: 5});

			// Ensuite on intègre des tokens de 5, 6 et 7 caractères consécutifs pour détecter des racines communes
			// Plus le token est long, plus le poids du token est important
			if (word.length >= 5) {
				for (let i = 0; i <= word.length - 5; i++) {
					const weight = i === 0 ? 0.6 : 0.4;
					const token = word.substring(i, i + 5)
					tokens.push({token,weight: weight});
				}
			}
			if (word.length >= 6) {
				for (let i = 0; i <= word.length - 6; i++) {
					const weight = i === 0 ? 0.6 : 0.8;
					const token = word.substring(i, i + 6)
					tokens.push({token,weight: weight});
				}
			}
			if (word.length >= 7) {
				for (let i = 0; i <= word.length - 7; i++) {
					const weight = i === 0 ? 1 : 0.8;
					const token = word.substring(i, i + 7)
					tokens.push({token,weight: weight});
				}
			}
		}
		return tokens;
	}
	
		// Fonction pour calculer le produit scalaire de deux vecteurs
		function dotProduct(vec1, vec2) {
			const commonWords = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
			let dot = 0;
			for (const word of commonWords) {
				dot += (vec1[word] || 0) * (vec2[word] || 0);
			}
			return dot;
		}
	
		// Fonction pour calculer la magnitude d'un vecteur
		function magnitude(vec) {
			let sum = 0;
			for (const word in vec) {
				sum += vec[word] ** 2;
			}
			return Math.sqrt(sum);
		}
	
		// Tokenize les deux chaînes
		const tokens1 = tokenize(str1);
		const tokens2 = tokenize(str2);
		// Créez des vecteurs de fréquence de mots
		const vec1 = {};
		const vec2 = {};
	
		for (const {token, weight} of tokens1) {
			if (token) {
				vec1[token] = (vec1[token] || 0) + weight;
			}
		}
	
		for (const {token, weight} of tokens2) {
			if (token) {
				vec2[token] = (vec2[token] || 0) + weight;
			}
		}

		// Calculez la similarité cosinus
		const dot = dotProduct(vec1, vec2);
		const mag1 = magnitude(vec1);
		const mag2 = magnitude(vec2);
	
		if (mag1 === 0 || mag2 === 0) {
			return 0; // Évitez la division par zéro
		} else {
			return dot / (mag1 * mag2);
		}
	}
	

	function chatbotResponse(userInputText) {
		// Choix de la réponse que le chatbot va envoyer
		let bestMatch = null;
		let bestMatchScore = 0;
		let bestDistanceScore = 0;
		let userInputTextToLowerCase = userInputText.toLowerCase();
		let indexBestMatch;

		let optionsLastResponseKeysToLowerCase;
		let indexLastResponseKeyMatch;
		if (optionsLastResponse) {
			// On va comparer le message de l'utilisateur aux dernières options proposées si il y en a une
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
				let response;
				if (yamlSearchInContent) {
						response = Array.isArray(responses) ? responses.join(" ").toLowerCase() : responses.toLowerCase();
						const cosSim = cosineSimilarity(userInputTextToLowerCase,response);
						matchScore = matchScore + cosSim;
				}
				for (let keyword of keywords) {
					let keywordToLowerCase = keyword.toLowerCase();
					if (userInputTextToLowerCase.includes(keywordToLowerCase)) {
						// Test de l'identité stricte
						// En cas d'identité stricte, on monte le score d'une valeur plus importante que 1 (définie par MATCH_SCORE_IDENTITY)
						matchScore = matchScore + MATCH_SCORE_IDENTITY;
					} else if (userInputTextToLowerCase.length > 4) {
						// Sinon : test de la similarité (seulement si le message de l'utilisateur n'est pas très court)
						distance = levenshteinDistance(
							keywordToLowerCase,
							userInputTextToLowerCase
						);
						if (distance < LEVENSHTEIN_THRESHOLD) {
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

			if (bestMatch) {
				// On envoie le meilleur choix s'il en existe un
				let selectedResponse = Array.isArray(bestMatch)
					? bestMatch.join("\n\n")
					: bestMatch;
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
			let messageOptions = "\n";
			for (let i = 0; i < options.length; i++) {
				const option = options[i];
				const optionText = option[0];
				const optionLink = option[1];
				messageOptions =
					messageOptions +
					'- <a href="#' +
					optionLink +
					'">' +
					optionText +
					"</a>\n";
			}
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
		/<span class=\"unique\">.*?\<\/span>/,
		""
	); // S'il y a un élément dans le message initial qui ne doit apparaître que la première fois qu'il est affiché, alors on supprime cet élément pour les prochaines fois
}
