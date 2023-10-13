function createChatBot(chatData) {
	const chatbotName = chatData.pop();
	let initialMessage = chatData.pop();
	document.getElementById("chatbot-name").textContent = chatbotName;

	const chatContainer = document.getElementById("chat");
	const userInput = document.getElementById("user-input");
	const sendButton = document.getElementById("send-button");

	// Gestion du markdown dans les réponses du chatbot
	var converter = new showdown.Converter();
	function markdownToHTML(text) {
		const html = converter.makeHtml(text);
		return html;
	}

	function typeWriter(content, element) {
		/* userInput.blur(); */
		/* userInput.setAttribute("contenteditable", false); */
		var typewriter = new Typewriter(element, {
			loop: false,
			delay: 10,
		});
		typewriter
			.typeString(content)
			.start()
			.callFunction(() => {
				/* userInput.setAttribute("contenteditable", true); */
				/* userInput.focus(); */
			});
	}

	// Création du message par le bot ou l'utilisateur
	function createChatMessage(message, isUser) {
		const chatMessage = document.createElement("div");
		chatMessage.classList.add("message");
		chatMessage.classList.add(isUser ? "user-message" : "bot-message");
		const html = markdownToHTML(message);
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

	function chatbotResponse(userInputText) {
		let bestMatch = null;
		let bestMatchScore = 0;
		let bestDistanceScore = 0;
		let userInputTextToLowerCase = userInputText.toLowerCase();
		let indexBestMatch;

		for (let i = 0; i < chatData.length; i++) {
			/* On teste l'identité ou la similarité entre les mots ou expressions clés et le message envoyé */
			const keywords = chatData[i][1];
			const responses = chatData[i][2];
			let matchScore = 0;
			let distanceScore = 0;
			let distance = 0;
			for (let keyword of keywords) {
				let keywordToLowerCase = keyword.toLowerCase();
				if (userInputTextToLowerCase.includes(keywordToLowerCase)) {
					// Test de l'identité stricte
					// En cas d'identité stricte, on monte le score d'une valeur plus importante que 1 (définie par MATCH_SCORE_IDENTITY)
					matchScore = matchScore + MATCH_SCORE_IDENTITY;
				} else {
					// Sinon : test de la similarité
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
			let response = Array.isArray(bestMatch)
				? bestMatch.join("\n")
				: bestMatch;
			const options = chatData[indexBestMatch][3];
			response = gestionOptions(response, options);
			createChatMessage(response, false);
		} else {
			// En cas de correspondance non trouvée, on envoie le message par défaut
			createChatMessage(defaultMessage, false);
		}
	}

	function gestionOptions(response, options) {
		if (options) {
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
			}, 100);
			userInput.innerText = "";
			window.scrollTo(0, document.body.scrollHeight);
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
			event.preventDefault();
			createChatMessage(target.innerText,true)
			const optionLink = target.getAttribute("href").substring(1);
			if (optionLink != '') {
			for (let i = 0; i < chatData.length; i++) {
				const title = chatData[i][0];
				if (optionLink == title) {
						let response = chatData[i][2];
						const options = chatData[i][3];
						response = Array.isArray(response) ? response.join("\n"): response;
						response = gestionOptions(response, options);
						createChatMessage(response, false);
					}
				}
			} else {
				createChatMessage(initialMessage, false)
			}
			window.scrollTo(0, document.body.scrollHeight);
		}
	});

	// Envoi du message d'accueil du chatbot
	initialMessage = gestionOptions(initialMessage[0].join('\n'),initialMessage[1])
	/* 
	initialMessage = initialMessage[0].join('\n') + '\n' + initialMessage[1].join('\n')
 */
	createChatMessage(initialMessage, false);
}
