function createChatBot(chatData) {
	let dynamicVariables = {};
	const params1 = Object.fromEntries(
		new URLSearchParams(document.location.search)
	);
	const params2 = Object.fromEntries(
		new URLSearchParams(document.location.hash.replace(/#.*\?/, ""))
	);
	const params = { ...params1, ...params2 };
	// On récupère les paramètres dans l'URL et on les place dans dynamicVariables
	// Si on utilise du contenu dynamique : on pourra utiliser ces variables
	for (const [key, value] of Object.entries(params)) {
		dynamicVariables["GET" + key] = value;
	}
	let nextMessageOnlyIfKeywordsCount = 0;
	const nextMessageOnlyIfKeywordsCountMax = 3;
	let messageIfKeywordsNotFound = "";
	let lastMessageFromBot = "";

	if (yamlFooter === false) {
		hideFooter();
	} else if (yamlFooter !== true) {
		footerElement.innerHTML = yamlFooter
	}

	const chatbotName = chatData.pop();
	let initialMessage = chatData.pop();
	document.getElementById("chatbot-name").textContent = chatbotName;
	document.title = chatbotName;

	let optionsLastResponse = null;
	let randomDefaultMessageIndex = Math.floor(
		Math.random() * defaultMessage.length
	);
	let randomDefaultMessageIndexLastChoice = [];

	// Création du message par le bot ou l'utilisateur
	function createChatMessage(message, isUser) {
		const chatMessage = document.createElement("div");
		chatMessage.classList.add("message");
		chatMessage.classList.add(isUser ? "user-message" : "bot-message");
		let nextSelected;
		// Gestion des variables fixes prédéfinies
		message = processFixedVariables(message);

		if (!isUser) {
			// Gestion du cas où il y a plusieurs messages possibles de réponse, séparés par "---"
			const messageSplitHR = message.split("\n---\n");
			if (messageSplitHR.length > 1) {
				const messageHasOptions = message.indexOf(
					'<ul class="messageOptions">'
				);
				if (messageHasOptions > -1) {
					const messageWithoutOptions = message.substring(0, messageHasOptions);
					const messageOptions = message.substring(messageHasOptions);
					const messageWithoutOptionsSplitHR =
						messageWithoutOptions.split("---");
					message =
						getRandomElement(messageWithoutOptionsSplitHR) + messageOptions;
				} else {
					message = getRandomElement(messageSplitHR);
				}
			}
		}

		if (yamlDynamicContent) {
			// On traite les variables dynamiques
			message = processDynamicVariables(message,dynamicVariables,isUser);
		}

		// Cas où c'est un message du bot
		if (!isUser) {
			// Gestion des éléments audio autoplay
			message = message.replaceAll(
				/<audio[\s\S]*?src="([^"]+)"[\s\S]*?<\/audio>/gm,
				function (match, v1) {
					if (match.includes("autoplay")) {
						const audio = new Audio(v1);
						audio.play();
						return `<!--${match}-->`;
					} else {
						return match;
					}
				}
			);
			// Gestion de l'audio avec la directive !Audio
			message = message.replaceAll(/!Audio:(.*)/g, function (match, v1) {
				const audio = new Audio(v1.trim());
				audio.play();
				return "";
			});

			// Gestion de la directive !Next: Titre réponse / message si mauvaise réponse
			message = message.replaceAll(/!Next ?:(.*)/g, function (match, v1) {
				const v1Split = v1.split("/");
				let v2;
				if (v1Split.length > 0) {
					v1 = v1Split[0];
					v2 = v1Split[1];
				} else {
					v1 = v1Split[0];
				}
				if (
					match &&
					nextMessageOnlyIfKeywordsCount < nextMessageOnlyIfKeywordsCountMax
				) {
					lastMessageFromBot = message;
					nextMessage = v1.trim();
					nextMessageOnlyIfKeywords = true;
					messageIfKeywordsNotFound = v2
						? v2.trim()
						: "Ce n'était pas la bonne réponse, merci de réessayer !";
					messageIfKeywordsNotFound = messageIfKeywordsNotFound + "\n\n";
					nextMessageOnlyIfKeywordsCount++;
					return "<!--" + "-->";
				} else {
					lastMessageFromBot = "";
					const linkToOption = nextMessage;
					nextMessage = "";
					nextMessageOnlyIfKeywords = false;
					if (
						nextMessageOnlyIfKeywordsCount == nextMessageOnlyIfKeywordsCountMax
					) {
						nextMessageOnlyIfKeywordsCount = 0;
						const skipMessage = `<ul class="messageOptions"><li><a href="#${
							yamlObfuscate ? btoa(linkToOption) : linkToOption
						}">Passer à la suite !</a></li></ul>`;
						return skipMessage;
					}
				}
			});
			// Gestion de la directive !SelectNext pour sélectionner aléatoirement le prochain message du chatbot
			message = message.replaceAll(/!SelectNext:(.*)/g, function (match, v1) {
				if (match) {
					const v1Split = v1.split("/");
					lastMessageFromBot = "";
					nextMessage = "";
					nextMessageOnlyIfKeywords = false;
					nextSelected = getRandomElement(v1Split).trim();
					return "";
				} else {
					nextSelected = undefined;
				}
			});
			// Gestion de schémas et images créés avec mermaid, tikz, graphviz, plantuml …  grâce à Kroki (il faut l'inclure en addOn si on veut l'utiliser)
			if (yamlUseAddOns && yamlUseAddOns.includes("kroki")) {
				message = message.replaceAll(
					/```(mermaid|tikz|graphviz|plantuml|excalidraw|vegalite|vega)((.|\n)*?)```/gm,
					function (match, type, source) {
						source = source.replaceAll("\n\n\n", "\n\n");
						return krokiCreateImageFromSource(type, source);
					}
				);
			}
		}

		let html = markdownToHTML(message);
		if (yamlMaths === true) {
			// S'il y a des maths, on doit gérer le Latex avant d'afficher le message
			html = convertLatexExpressions(html);
			setTimeout(() => {
				displayMessage(html, isUser, chatMessage);
			}, 100);
		} else {
			displayMessage(html, isUser, chatMessage);
		}
		if (nextSelected) {
			chatbotResponse(nextSelected);
		}
	}

	const LEVENSHTEIN_THRESHOLD = 3; // Seuil de similarité
	const MATCH_SCORE_IDENTITY = 5; // Pour régler le fait de privilégier l'identité d'un mot à la simple similarité
	const BESTMATCH_THRESHOLD = 0.55; // Seuil pour que le bestMatch soit pertinent

	function responseToSelectedOption(optionLink) {
		// Gestion de la réponse à envoyer si on sélectionne une des options proposées
		if (optionLink != "") {
			for (let i = 0; i < chatData.length; i++) {
				let title = chatData[i][0];
				title = yamlObfuscate ? btoa(title) : title;
				if (optionLink == title) {
					let response = chatData[i][2];
					const options = chatData[i][3];
					response = Array.isArray(response) ? response.join("\n\n") : response;
					optionsLastResponse = options;
					response = options ? gestionOptions(response, options) : response;
					createChatMessage(response, false);
					break;
				}
			}
		} else {
			createChatMessage(initialMessage, false);
		}
	}

	let vectorChatBotResponses = [];
	// On précalcule les vecteurs des réponses du chatbot
	if (yamlSearchInContent || yamlUseLLM) {
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
	let vectorRAGinformations = [];

	function createVectorRAGinformations(informations) {
		if (informations) {
			for (let i = 0; i < informations.length; i++) {
				const RAGinformation = informations[i];
				const vectorRAGinformation = createVector(RAGinformation);
				vectorRAGinformations.push(vectorRAGinformation);
			}
		}
	}

	if (window.useLLMpromise) {
		window.useLLMpromise
			.then(() => {
				if (window.useLLMragContentPromise) {
					window.useLLMragContentPromise.then(() => {
						createVectorRAGinformations(yamlUseLLMinformations);
					});
				} else {
					createVectorRAGinformations(yamlUseLLMinformations);
				}
			})
			.catch((error) => {
				console.error("Erreur d'accès aux données RAG : ", error);
			});
	}

	function chatbotResponse(inputText) {
		// Cas où on va directement à un prochain message (sans même avoir à tester la présence de keywords)
		if (nextMessage != "" && !nextMessageOnlyIfKeywords) {
			inputText = nextMessage;
		}
		let RAGbestMatchesInformation = "";
		let questionToLLM;
		if (yamlUseLLM) {
			inputText = inputText.replace(
				'<span class="hidden">!useLLM</span>',
				"!useLLM"
			);
			questionToLLM = inputText.trim().replace("!useLLM", "");
			if (yamlUseLLMinformations) {
				// On ne retient dans les informations RAG que les informations pertinentes par rapport à la demande de l'utilisateur
				const cosSimArray = vectorRAGinformations.map((vectorRAGinformation) =>
					cosineSimilarity(questionToLLM, vectorRAGinformation)
				);
				const RAGbestMatchesIndexes = topElements(
					cosSimArray,
					yamlUseLLMmaxTopElements
				);
				RAGbestMatchesInformation = RAGbestMatchesIndexes.map(
					(element) => yamlUseLLMinformations[element[1]]
				).join("\n");
			}
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
				// Si on a la directive !Next, on teste seulement la similarité avec la réponse indiquée dans !Next et on saute toutes les autres réponses
				if (nextMessageOnlyIfKeywords && titleResponse != nextMessage) {
					continue;
				}
				// Si on a la directive !Next, alors si la réponse à tester ne contient pas de conditions, on va directement vers cette réponse
				if (
					nextMessageOnlyIfKeywords &&
					titleResponse == nextMessage &&
					keywordsResponse.length == 0
				) {
					userInputTextToLowerCase = nextMessage.toLowerCase();
				}
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
						if (nextMessageOnlyIfKeywords) {
							// Si on utilise la directive !Next, on vérifie que le keyword n'est pas entouré de lettres ou de chiffres dans le message de l'utilisateur
							userInputTextToLowerCase = removeAccents(
								userInputTextToLowerCase
							);
							keywordToLowerCase = removeAccents(keywordToLowerCase);
							const regexStrictIdentityMatch = new RegExp(
								`\\b${keywordToLowerCase}\\b`
							);
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
				if (
					matchScore > 0 &&
					nextMessageOnlyIfKeywords &&
					titleResponse == nextMessage
				) {
					matchScore = matchScore + MATCH_SCORE_IDENTITY;
				}
				if (matchScore > bestMatchScore) {
					bestMatch = responses;
					bestMatchScore = matchScore;
					indexBestMatch = i;
				}
			}
			// Soit il y a un bestMatch, soit on veut aller directement à un prochain message mais seulement si la réponse inclut les keywords correspondant (sinon on remet le message initial)
			if (
				(bestMatch && bestMatchScore > BESTMATCH_THRESHOLD) ||
				nextMessageOnlyIfKeywords
			) {
				if (bestMatch && nextMessageOnlyIfKeywords) {
					// Réinitialiser si on a trouvé la bonne réponse après une directive !Next
					lastMessageFromBot = "";
					nextMessage = "";
					nextMessageOnlyIfKeywords = false;
				}
				// On envoie le meilleur choix s'il en existe un
				let selectedResponseWithoutOptions = bestMatch
					? Array.isArray(bestMatch)
						? bestMatch.join("\n\n")
						: bestMatch
					: "";
				const titleBestMatch = bestMatch ? chatData[indexBestMatch][0] : "";
				let optionsSelectedResponse = bestMatch
					? chatData[indexBestMatch][3]
					: [];
				// Cas où on veut aller directement à un prochain message mais seulement si la réponse inclut les keywords correspondant (sinon on remet le message initial)
				if (nextMessageOnlyIfKeywords && titleBestMatch !== nextMessage) {
					selectedResponseWithOptions = lastMessageFromBot.includes(
						messageIfKeywordsNotFound
					)
						? lastMessageFromBot
						: messageIfKeywordsNotFound + lastMessageFromBot;
				} else {
					selectedResponseWithOptions = gestionOptions(
						selectedResponseWithoutOptions,
						optionsSelectedResponse
					);
				}
				// Si on a dans le yaml useLLM avec le paramètre `always: true` OU BIEN si on utilise la directive !useLLM dans l'input, on utilise un LLM pour répondre à la question
				if (
					(yamlUseLLM &&
						yamlUseLLMurl &&
						yamlUseLLMmodel &&
						yamlUseLLMalways) ||
					inputText.includes("!useLLM")
				) {
					getAnswerFromLLM(
						questionToLLM.trim(),
						selectedResponseWithoutOptions + "\n" + RAGbestMatchesInformation
					);
					return;
				} else {
					createChatMessage(selectedResponseWithOptions, false);
				}
			} else {
				if (
					(yamlUseLLM &&
						yamlUseLLMurl &&
						yamlUseLLMmodel &&
						yamlUseLLMalways) ||
					inputText.includes("!useLLM")
				) {
					getAnswerFromLLM(questionToLLM, RAGbestMatchesInformation);
					return;
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
					let messageNoAnswer = defaultMessage[randomDefaultMessageIndex];
					if (
						yamlUseLLM &&
						!yamlUseLLMalways &&
						yamlUseLLMurl &&
						yamlUseLLMmodel
					) {
						const optionMessageNoAnswer = [
							["Voir une réponse générée par une IA", "!useLLM " + inputText],
						];
						messageNoAnswer = gestionOptions(
							messageNoAnswer,
							optionMessageNoAnswer
						);
					}
					createChatMessage(messageNoAnswer, false);
				}
			}
		}
	}

	function gestionOptions(response, options) {
		// Si on a du contenu dynamique et qu'on utilise <!-- if @VARIABLE==VALEUR --> on filtre d'abord les options si elles dépendent d'une variable
		if (yamlDynamicContent && Object.keys(dynamicVariables).length > 0) {
			if (options) {
				options = options.filter((element) => {
					for (const [key, value] of Object.entries(dynamicVariables)) {
						// Cas où l'option ne dépend d'aucune variable
						if (!element[3]) {
							return true;
						}
						// Cas où l'option dépend d'une variable et où l'option inclut une variable qui est présente dans dynamicVariables
						if (element[3] && element[3].includes(`@${key}`)) {
							// On regarde alors si l'option doit être gardée ou pas en fonction de la valeur de la variable
							if (element[3] === `@${key}==${value}`) {
								return true;
							} else {
								return false;
							}
						}
					}
				});
			}
		}

		// S'il y a la directive !Select: x on sélectionne aléatoirement seulement x options dans l'ensemble des options disponibles
		response = response.replaceAll(
			/\!Select ?: ?([0-9]*)/g,
			function (match, v1) {
				if (match && v1 <= options.length) {
					options = shuffleArray(options).slice(0, v1);
					return "<!--" + match + "-->";
				} else {
					return "";
				}
			}
		);
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
		} else {
			const enterEvent = new KeyboardEvent("keypress", {
				key: "Enter",
				keyCode: 13,
				which: 13
			  });
			userInput.dispatchEvent(enterEvent);
		}
	});

	document.addEventListener("keypress", (event) => {
		userInput.focus();
		if (event.key === "Enter") {
			event.preventDefault();
			sendButton.click();
			scrollWindow();
		} else if (
			userInput.parentElement.parentElement.classList.contains("hideControls")
		) {
			// Si l'userInput est caché : on désactive l'entrée clavier (sauf pour Enter qui permet toujours d'afficher plus vite la suite)
			event.preventDefault();
		}
	});

	userInput.focus({ preventScroll: true });

	userInput.addEventListener("focus", function () {
		this.classList.remove("placeholder");
	});

	userInput.addEventListener("blur", function () {
		this.classList.add("placeholder");
	});

	function handleClick(event) {
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
				let messageFromLink = target.innerText;
				// Si on a utilisé la directive !useLLM dans le lien d'un bouton : on renvoie vers une réponse par un LLM
				const linkDeobfuscated = yamlObfuscate
					? atob(link.replace("#", ""))
					: link;
				if (
					yamlUseLLM &&
					yamlUseLLMurl &&
					yamlUseLLMmodel &&
					linkDeobfuscated.includes("!useLLM")
				) {
					messageFromLink = linkDeobfuscated
						.replace("#", "")
						.replace("!useLLM", '<span class="hidden">!useLLM</span>')
						.trim();
					createChatMessage(messageFromLink, true);
					chatbotResponse(messageFromLink);
				} else {
					createChatMessage(messageFromLink, true);
					const optionLink = link.substring(1);
					responseToSelectedOption(optionLink);
					// Supprimer le focus sur le bouton qu'on vient de cliquer
					document.activeElement.blur();
					// Refocaliser sur userInput
					if (autoFocus) {
						userInput.focus();
					}
				}
				scrollWindow();
			}
		}
	}

	chatContainer.addEventListener("click", (event) => handleClick(event));

	// Envoi du message d'accueil du chatbot
	initialMessage = gestionOptions(
		initialMessage[0].join("\n"),
		initialMessage[1]
	);

	if (yamlDynamicContent) {
		// S'il y a des variables dynamiques dans le message initial, on les traite
		initialMessage = processDynamicVariables(initialMessage,dynamicVariables,false);
	}

	createChatMessage(initialMessage, false);
	initialMessage = initialMessage.replace(
		/<span class=\"unique\">.*?<\/span>/,
		""
	); // S'il y a un élément dans le message initial qui ne doit apparaître que la première fois qu'il est affiché, alors on supprime cet élément pour les prochaines fois
}
