function createChatBot(chatData) {

	const customVariables = {};
	let nextMessage = '';
	let nextMessageOnlyIfKeywords = false;
	let messageIfKeywordsNotFound = '';
	let getLastMessage = false;
	let lastMessageFromBot = '';
	const signalGetAnswerFromLLM = '<span class="hidden">!getAnswerFromLLM</span>';

	const footerElement = document.getElementById("footer");
	const controlsElement = document.getElementById("controls");
	if (yamlFooter === false) {
		footerElement.style.display = "none";
		controlsElement.style.height = "70px";
		const styleControls =
			"@media screen and (max-width: 500px) { #controls {height:110px!important}}";
		const styleSheet = document.createElement("style");
		styleSheet.innerText = styleControls;
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

	// Gestion du scroll automatique vers le bas
	function scrollWindow() {
		window.scrollTo(0, document.body.scrollHeight);
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
								const type = matchInformations[1];
								let title = matchInformations[2];
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
	function markdownToHTML(text) {
		text = text.replaceAll("\n\n|", "|");
		const html = converter.makeHtml(text);
		return html;
	}

	function getRandomElement(array) {
		return array[Math.floor(Math.random() * array.length)];
	}
	function randomContentMessage(contentMessage) {
		const contentSplitHR = contentMessage.split("<hr />");
		if (contentSplitHR.length > 1) {
			contentMessage = getRandomElement(contentSplitHR);
		}
		return contentMessage;
	}
	const conversationElement = document.getElementById("chat");

	// Le focus automatique sur l'userInput est désactivé sur les téléphones mobiles
	const isMobile =
		/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
			navigator.userAgent
		);
	const autoFocus = isMobile ? false : true;

	let typed;
	const pauseTypeWriter = "^300 ";
	const stopTypeWriterExecutionTimeThreshold = 800;
	// Effet machine à écrire
	function typeWriter(content, element) {
		// Gestion de "Enter" pour stopper l'effet machine à écrire
		const messageTypeEnterToStopTypeWriter =
			window.innerWidth > 880
				? "Appuyez sur “Enter” pour stopper l'effet “machine à écrire” et afficher la réponse immédiatement"
				: "“Enter” pour stopper l'effet “machine à écrire”";
		function stopTypeWriter(slowContent) {
			typed.stop();
			typed.reset();
			typed.strings = ["`" + slowContent.replace(pauseTypeWriter + "`", "")];
			typed.start();
			typed.destroy();
		}

		function keypressHandler(event) {
			if (event.key === "Enter") {
				mutationObserver.disconnect();
				observerConnected = false;
				stopTypeWriter(content);
			}
		}

		let counter = 0;
		const start = Date.now();
		let observerConnected = true;
		function handleMutation() {
			// On arrête l'effet “machine à écrire” si le temps d'exécution est trop important
			const executionTime = Date.now() - start;
			if (
				counter == 50 &&
				executionTime > stopTypeWriterExecutionTimeThreshold &&
				observerConnected
			) {
				stopTypeWriter(content);
				observerConnected = false;
			}
			// On scrolle automatiquement la fenêtre pour suivre l'affichage du texte
			scrollWindow();
		}

		// Configuration de MutationObserver
		const observerConfig = {
			childList: true,
			subtree: true,
		};

		// Gestion du choix d'un message au hasard quand il y a plusieurs réponses possibles
		const optionsStart = content.lastIndexOf('<ul class="messageOptions">');
		if (optionsStart !== -1 && content.endsWith("</a></li>\n</ul>")) {
			let contentMessage = content.substring(0, optionsStart);
			contentMessage = randomContentMessage(contentMessage);
			const contentOptions = content.substring(optionsStart);
			content = contentMessage + pauseTypeWriter + "`" + contentOptions + "`";
		} else {
			content = randomContentMessage(content);
		}
		// Effet machine à écrire
		let mutationObserver
		typed = new Typed(element, {
			strings: [content],
			typeSpeed: -5000,
			startDelay: 100,
			showCursor: false,
			onBegin: () => {
				// Quand l'effet démarre, on refocalise sur userInput (sauf sur les smartphones)
				if (autoFocus) {
					userInput.focus();
				}
				// On détecte un appui sur Enter pour stopper l'effet machine à écrire
				userInput.addEventListener("keypress", keypressHandler);
				userInput.setAttribute("placeholder", messageTypeEnterToStopTypeWriter);

				// On détecte le remplissage petit à petit du DOM pour scroller automatiquement la fenêtre vers le bas
				mutationObserver = new MutationObserver(handleMutation);
				function enableAutoScroll() {
					mutationObserver.observe(conversationElement, observerConfig);
				}
				enableAutoScroll();

				setTimeout(() => {
					// Arrêter le scroll automatique en cas de mouvement de la souris ou de contact avec l'écran
					document.addEventListener("mousemove", function () {
						observerConnected = false;
						mutationObserver.disconnect();
					});
					document.addEventListener("wheel", function (e) {
						// On remet le scroll automatique si on scrolle vers le bas de la page
						if (e.deltaY > 0) {
							// On détecte si on a fait un mouvement vers le bas
							if (
								window.scrollY + window.innerHeight >=
								document.body.offsetHeight
							) {
								enableAutoScroll();
							} else {
								observerConnected = false;
								mutationObserver.disconnect();
							}
						} else {
							observerConnected = false;
							mutationObserver.disconnect();
						}
					});
					document.addEventListener("touchstart", function () {
						observerConnected = false;
						mutationObserver.disconnect();
						// On remet le scroll automatique si on scrolle vers le bas de la page
						setTimeout(() => {
							if (
								window.scrollY + window.innerHeight + 200 >=
								document.documentElement.scrollHeight
							) {
								enableAutoScroll();
							}
						}, 5000);
					});
				}, 1000);
			},
			onComplete: () => {
				// Quand l'effet s'arrête on supprime la détection du bouton Enter pour stopper l'effet
				userInput.removeEventListener("keypress", keypressHandler);
				if (
					userInput.getAttribute("placeholder") ==
					messageTypeEnterToStopTypeWriter
				) {
					userInput.setAttribute("placeholder", "Écrivez votre message");
				}
				mutationObserver.disconnect();
			},
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
		return content.replace(/@{(\S+)}/g, function (match, variableName) {
			if (yamlData.variables[variableName]) {
				return yamlData.variables[variableName];
			} else {
				return "@{" + variableName + "}";
			}
		});
	}

	function displayMessage(html, isUser, chatMessage) {
		// Effet machine à écrire : seulement quand c'est le chatbot qui répond, sinon affichage direct
		// Pas d'effet machine à écrire s'il y a la préférence : "prefers-reduced-motion"
		chatContainer.appendChild(chatMessage);
		if (
			isUser ||
			window.matchMedia("(prefers-reduced-motion: reduce)").matches || yamlTypeWriter === false
		) {
			chatMessage.innerHTML = html;
		} else {
			typeWriter(html, chatMessage);
		}
	}

	// Création du message par le bot ou l'utilisateur
	function createChatMessage(message, isUser) {
		const chatMessage = document.createElement("div");
		chatMessage.classList.add("message");
		chatMessage.classList.add(isUser ? "user-message" : "bot-message");

		// Gestion de la directive !Next: Titre réponse / message si mauvaise réponse
		if (!isUser) {
			message = message.replaceAll(/!Next ?:(.*)/g, function(match,v1) {
				const v1Split = v1.split('/');
				let v2;
				if(v1Split.length>0) {
					v1 = v1Split[0];
					v2 = v1Split[1]
				} else {
					v1 = v1Split[0];
				}
				if(match) {
					lastMessageFromBot = message;
					nextMessage = v1.trim();
					nextMessageOnlyIfKeywords = true;
					messageIfKeywordsNotFound = v2 ? v2.trim() : "Ce n'était pas la bonne réponse, merci de réessayer !";
					return '<!--'+'-->';
				} else {
					lastMessageFromBot = '';
					nextMessage = '';
					nextMessageOnlyIfKeywords = false;
				}
			})
		}

		if (yamlDynamicContent) {
			// Cas où le message vient du bot
			if (!isUser) {
				// On remplace dans le texte les variables `@nomVariable` par leur valeur
				message = message.replaceAll(/\`@([^\s]*?)\`/g, function(match, v1) {
					return customVariables[v1] ? customVariables[v1] : "";
				})
				// On masque dans le texte les demandes de définition d'une variable par le prochain Input
				message = message.replaceAll(/\`@([^\s]*?) ?= ?@INPUT : (.*)\`/g,function(match,v1,v2) {
					getLastMessage = match ? [v1,v2]: false;
					return '';
				});
				// On traite le cas des assignations de valeurs à une variable, et on masque dans le texte ces assignations
				message = message.replaceAll(/\`@([^\s]*?) ?= ?(?<!@)(.*?)\`/g, function(match, v1, v2) {
					customVariables[v1]=v2;
					return '';
				})
				// Au lieu de récupérer l'input, on peut récupérer le contenu d'un bouton qui a été cliqué et on assigne alors ce contenu à une variable : pour cela on intègre la variable dans le bouton, et on la masque avec la classe "hidden"
				message = message.replaceAll(/ (@[^\s]*?\=.*?)\</g,'<span class="hidden">$1</span><')
				message = message.replaceAll(/>(@[^\s]*?\=)/g,'><span class="hidden">$1</span>')
				// Traitement du cas où on a l'affichage d'un contenu est conditionné par la valeur d'une variable
				message = message.replaceAll(/\`if (.*?)\`((\n|.*)*?)\`endif\`/g, function(match, v1, v2) {
					if(v1) {
						const conditionalVariables = v1.split('&&');
						let checkConditionalVariables = false;
						// On peut avoir un conditionnement multiple en testant sur plusieurs variables
						for (const conditionalVariable of conditionalVariables) {
							let conditionalVariableMatch = conditionalVariable.trim().match(/@([^\s]*?) ?== ?(.*)/);
							if (conditionalVariableMatch) {
								const conditionalVariableMatchVariable = conditionalVariableMatch[1]
								const conditionalVariableMatchValue = conditionalVariableMatch[2] == "undefined" ? undefined : conditionalVariableMatch[2];
								if (customVariables[conditionalVariableMatchVariable] == conditionalVariableMatchValue) {
									checkConditionalVariables = true;
								} else {
									checkConditionalVariables = false;
									break;
								}
							}
						}
						if (checkConditionalVariables === true) {
							return v2;
						} else {
							return '<!--'+v1+'-->';
						}
					} else {
						return '<!--'+v1+'-->';
					}
				})
			} else {
			// Cas où le message vient de l'utilisateur
				// Traitement du cas où on a dans le message une assignation de variable (qui vient du fait qu'on a cliqué sur une option qui intégrait cette demande d'assignation de variable)
				message = message.replaceAll(/@([^\s]*?)\=(.*)/g, function(match, v1, v2, offset) {
					customVariables[v1]=v2;
					// S'il n'y avait pas de texte en plus de la valeur de la variable, on garde la valeur de la variable dans le bouton, sinon on l'enlève
					return offset == 0 ? v2 : '';
				})
				
				if (getLastMessage) {
					// Si dans le précédent message, on avait demandé à récupérer l'input : on récupère cette input et on le met dans la variable correspondante
					// Puis on renvoie vers le message correspondant
					if (getLastMessage && getLastMessage.length > 0) {
						customVariables[getLastMessage[0]] = message
						nextMessage = getLastMessage[1];
						getLastMessage = false;
					} else {
						nextMessage = '';
					}
				} else {
					nextMessage = '';
				}
			}
		}
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
					break;
				}
			}
		} else {
			createChatMessage(initialMessage, false);
		}
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

	function tokenize(text, indexChatBotResponse) {
		// Fonction pour diviser une chaîne de caractères en tokens, éventuellement en prenant en compte l'index de la réponse du Chatbot (pour prendre en compte différement les tokens présents dans le titre de la réponse)

		// On garde d'abord seulement les mots d'au moins 5 caractères et on remplace les lettres accentuées par l'équivalent sans accent
		let words = text.toLowerCase();
		words = words.replace(/,|\.|\:|\?|\!|\(|\)|\[|\||\/\]/g, "");
		words = removeAccents(words);
		words = words.split(/\s|'/).filter((word) => word.length >= 5) || [];
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
			tokens.push({ word, weight: 5 });
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

	let vectorChatBotResponses = [];
	// On précalcule les vecteurs des réponses du chatbot
	if (yamlSearchInContent) {
		for (let i = 0; i < chatData.length; i++) {
			const responses = chatData[i][2];
			let response = Array.isArray(responses)
				? responses.join(" ").toLowerCase()
				: responses.toLowerCase();
			response = chatData[i][0] + " " + response;
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

	function chatbotResponse(inputText) {
		// Cas où on va directement à un prochain message (sans même avoir à tester la présence de keywords)
		if (nextMessage !='' && !nextMessageOnlyIfKeywords) {
			inputText = nextMessage
		}
		//inputText = signalGetAnswerFromLLM + inputText
		if(inputText.includes(signalGetAnswerFromLLM)){
			getAnswerFromLLM(inputText.replace(signalGetAnswerFromLLM,''))
			return;
		}

		// Choix de la réponse que le chatbot va envoyer
		if (yamldetectBadWords === true && filterBadWords) {
			if (filterBadWords.check(inputText)) {
				createChatMessage(getRandomElement(badWordsMessage), false);
				return;
			}
		}

		let bestMatch = null;
		let bestMatchScore = 0;
		let bestDistanceScore = 0;
		let userInputTextToLowerCase = inputText.toLowerCase();
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
				const titleResponse = chatData[i][0];
				const keywordsResponse = chatData[i][1];
				const keywords = keywordsResponse.concat(titleResponse);
				const responses = chatData[i][2];
				let matchScore = 0;
				let distanceScore = 0;
				if (yamlSearchInContent) {
					const cosSim = cosineSimilarity(
						userInputTextToLowerCase,
						vectorChatBotResponses[i]
					);
					matchScore = matchScore + cosSim + 0.5;
				}
				for (let keyword of keywords) {
					let keywordToLowerCase = keyword.toLowerCase();
					if (userInputTextToLowerCase.includes(keywordToLowerCase)) {
						// Test de l'identité stricte
						let strictIdentityMatch = false;
						if(nextMessageOnlyIfKeywords) {
							// Si on utilise la directive !Next, on vérifie que le keyword n'est pas entouré de lettres ou de chiffres dans le message de l'utilisateur
							const regexStrictIdentityMatch = new RegExp(`\\b${keywordToLowerCase}\\b`);
							if (userInputTextToLowerCase.match(regexStrictIdentityMatch)) {
								strictIdentityMatch = true;
							}
						} else {
							strictIdentityMatch = true;
						}
						if (strictIdentityMatch) {
							// En cas d'identité stricte, on monte le score d'une valeur plus importante que 1 (définie par MATCH_SCORE_IDENTITY)
							matchScore = matchScore + MATCH_SCORE_IDENTITY;
							// On privilégie les correspondances sur les keywords plus longs
							matchScore = matchScore + keywordToLowerCase.length / 10;
						}
					} else if (userInputTextToLowerCase.length > 4) {
						// Sinon : test de la similarité (seulement si le message de l'utilisateur n'est pas très court)
						if (
							hasLevenshteinDistanceLessThan(
								userInputTextToLowerCase,
								keyword,
								LEVENSHTEIN_THRESHOLD
							)
						) {
							distanceScore++;
						}
					}
				}
				if (matchScore == 0 && !nextMessageOnlyIfKeywords) {
					// En cas de simple similarité : on monte quand même le score, mais d'une unité seulement. Mais si on est dans le mode où on va directement à une réponse en testant la présence de keywords, la correspondance doit être stricte, on ne fait pas de calcul de similarité
					if (distanceScore > bestDistanceScore) {
						matchScore++;
						bestDistanceScore = distanceScore;
					}
				}
				// Si on a la directive !Next : titre réponse, alors on augmente de manière importante le matchScore si on a un matchScore > 0 et que la réponse correspond au titre de la réponse voulue dans la directive
				if (matchScore > 0 && nextMessageOnlyIfKeywords && titleResponse == nextMessage) {
					matchScore = matchScore + MATCH_SCORE_IDENTITY;
				}
				if (matchScore > bestMatchScore) {
					bestMatch = responses;
					bestMatchScore = matchScore;
					indexBestMatch = i;
				}
			}
			// Soit il y a un bestMatch, soit on veut aller directement à un prochain message mais seulement si la réponse inclut les keywords correspondant (sinon on remet le message initial)
			if ((bestMatch && bestMatchScore > BESTMATCH_THRESHOLD) || nextMessageOnlyIfKeywords) {
				// On envoie le meilleur choix s'il en existe un
				let selectedResponse = bestMatch ? Array.isArray(bestMatch)
					? bestMatch.join("\n\n")
					: bestMatch : '';
				const titleBestMatch = bestMatch ? chatData[indexBestMatch][0] : '';
				let optionsSelectedResponse =  bestMatch ? chatData[indexBestMatch][3] : [];
				// Cas où on veut aller directement à un prochain message mais seulement si la réponse inclut les keywords correspondant (sinon on remet le message initial) 
				if (nextMessageOnlyIfKeywords && titleBestMatch !== nextMessage) {
						selectedResponse =  messageIfKeywordsNotFound + '\n\n' + lastMessageFromBot.replace(messageIfKeywordsNotFound + '\n\n','');
				} else {
					selectedResponse = gestionOptions(selectedResponse, optionsSelectedResponse);
				}
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
		randomizableElements = shuffleArray(randomizableElements)

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
		if(Array.isArray(array)) {
			for (let i = 0; i < array.length; i++) {
			if (array[i][2] === true) {
				return true;
			}
			}
		}
		return false;
	  }

	function gestionOptions(response, options) {
		// S'il y a la directive !Select: x on sélectionne aléatoirement seulement x options dans l'ensemble des options disponibles
		response = response.replaceAll(/\!Select ?: ?([0-9]*)/g, function(match, v1) {
			if(match && v1<=options.length) {
				options = shuffleArray(options).slice(0,v1);
				return '<!--'+match+'-->'
			} else {
				return ''
			}
		})
		// On teste s'il faut mettre de l'aléatoire dans les options
		if (shouldBeRandomized(options)) {
			options = randomizeArrayWithFixedElements(options);
		}
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
				scrollWindow();
			}, 100);
			userInput.innerText = "";
		}
	});

	userInput.addEventListener("keypress", (event) => {
		if (event.key === "Enter") {
			event.preventDefault();
			sendButton.click();
			scrollWindow();
		}
	});

	document.addEventListener("keypress", (event) => {
		userInput.focus();
	});

	userInput.focus({ preventScroll: true });

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
				scrollWindow();
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
