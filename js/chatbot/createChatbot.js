import { config } from "../config";
import { yaml, filterBadWords } from "../processMarkdown/yaml";
import {
	topElements,
	getRandomElement,
	shouldBeRandomized,
	randomizeArrayWithFixedElements,
} from "../utils/arrays";
import { scrollWindow } from "../utils/ui";
import {
	nextMessage,
	processAudio,
	processDirectiveBot,
	processDirectiveNext,
	processDirectiveSelect,
	processDirectiveSelectNext,
	processKroki,
	processMultipleBots,
	processRandomMessage,
} from "../processMarkdown/directivesAndSpecialContents";
import { processFixedVariables } from "../processMarkdown/processFixedVariables";
import {
	processDynamicVariables,
	evaluateExpression,
} from "../processMarkdown/processDynamicVariables";
import { convertLatexExpressions } from "../processMarkdown/convertLatex";
import { markdownToHTML } from "../processMarkdown/markdownToHTML";
import {
	displayMessage,
	autoFocus,
	chatContainer,
	userInput,
} from "./typewriter";
import {
	removeAccents,
	hasLevenshteinDistanceLessThan,
	cosineSimilarity,
	createVector,
	longestCommonSubstring,
} from "./nlp";
import { getAnswerFromLLM } from "../LLM/useLLM";
import {
	getRAGcontent,
	vectorRAGinformations,
	RAGcontent,
} from "../LLM/processRAG";
import { splitMarkdownAndLLMPrompts } from "../LLM/splitMarkdownAndLLMPrompts";

const sendButton = document.getElementById("send-button");

export async function createChatBot(chatData) {
	let dynamicVariables = {};
	const params1 = Object.fromEntries(
		new URLSearchParams(document.location.search),
	);
	const params2 = Object.fromEntries(
		new URLSearchParams(document.location.hash.replace(/#.*\?/, "")),
	);
	const params = { ...params1, ...params2 };
	// On récupère les paramètres dans l'URL et on les place dans dynamicVariables
	// Si on utilise du contenu dynamique : on pourra utiliser ces variables
	for (const [key, value] of Object.entries(params)) {
		dynamicVariables["GET" + key] = value;
	}

	const chatbotName = chatData.pop()[0];
	let initialMessage = chatData.pop();
	const chatDataLength = chatData.length;
	const chatbotNameHTML = markdownToHTML(chatbotName).replace(/<\/?p>/g, "");
	document.getElementById("chatbot-name").innerHTML = chatbotNameHTML;
	document.title = chatbotNameHTML;

	let optionsLastResponse = null;
	let randomDefaultMessageIndex = Math.floor(
		Math.random() * config.defaultMessage.length,
	);
	let randomDefaultMessageIndexLastChoice = [];

	// Création du message par le bot ou l'utilisateur
	function createChatMessage(message, isUser) {
		const chatMessage = document.createElement("div");
		chatMessage.classList.add("message");
		chatMessage.classList.add(isUser ? "user-message" : "bot-message");
		nextMessage.selected = undefined;
		// Gestion des variables fixes prédéfinies
		if (yaml.variables) {
			message = processFixedVariables(message);
		}
		if (!isUser) {
			message = processRandomMessage(message);
		}

		if (yaml.dynamicContent) {
			// On traite les variables dynamiques
			message = processDynamicVariables(message, dynamicVariables, isUser);
		}

		// Cas où c'est un message du bot
		if (!isUser) {
			// Gestion de la directive !Bot: botName
			if (yaml.bots) {
				message = processDirectiveBot(message, chatMessage);
			}

			// Gestion de l'audio
			message = processAudio(message);

			// Gestion de la directive !Next: Titre réponse / message si mauvaise réponse
			message = processDirectiveNext(message);

			// Gestion de la directive !SelectNext pour sélectionner aléatoirement le prochain message du chatbot
			message = processDirectiveSelectNext(message);

			// Gestion de schémas et images créés avec mermaid, tikz, graphviz, plantuml …  grâce à Kroki (il faut l'inclure en addOn si on veut l'utiliser)
			if (yaml.addOns && yaml.addOns.includes("kroki")) {
				message = processKroki(message);
			}
		}
		let hasPromptInMessage = false;
		if (yaml.useLLM.url) {
			message = splitMarkdownAndLLMPrompts(message);
			hasPromptInMessage = Array.isArray(message);
		}

		if (hasPromptInMessage) {
			// On gère le cas où il y a une partie dans le message qui doit être gérée par un LLM
			function displayMessageOrGetAnswerFromLLM(
				useLLM,
				content,
				isUser,
				chatMessageElement,
				chatMessage,
			) {
				return new Promise((resolve) => {
					if (useLLM && content.trim() !== "") {
						getAnswerFromLLM(content, "", chatMessageElement, chatMessage).then(
							() => resolve(),
						);
					} else {
						if (yaml.maths === true) {
							// S'il y a des maths, on doit gérer le Latex avant d'afficher le message
							content = convertLatexExpressions(content);
							setTimeout(() => {
								displayMessage(
									content,
									isUser,
									chatMessageElement,
									chatMessage,
								).then(() => resolve());
							}, 100);
						} else {
							displayMessage(
								content,
								isUser,
								chatMessageElement,
								chatMessage,
							).then(() => resolve());
						}
					}
				});
			}
			function processMessagesSequentially(parts) {
				// On a découpé en parties le message et selon qu'on est dans une partie Markdown ou une partie LLM : on gère le contenu en fonction en enchaînant des Promesses, afin d'attendre que le contenu soit généré jusqu'à la fin pour pouvoir passer à la suite
				let index = 0;
				return parts.reduce((promiseChain, currentPart) => {
					const chatMessageElement = document.createElement("div");
					let content;
					let useLLM = false;
					if (index % 2 == 0) {
						// Gestion du contenu en Markdown
						content = markdownToHTML(currentPart);
						if (yaml.bots) {
							content = processMultipleBots(content);
						}
					} else {
						// Gestion du contenu qui fait appel à un LLM
						useLLM = true;
						content = currentPart;
					}
					index++;
					// Pour chaque élément, on ajoute une promesse à la chaîne
					return promiseChain.then(() =>
						displayMessageOrGetAnswerFromLLM(
							useLLM,
							content,
							isUser,
							chatMessageElement,
							chatMessage,
						),
					);
				}, Promise.resolve());
			}
			processMessagesSequentially(message);
		} else {
			let html = markdownToHTML(message);
			if (yaml.bots) {
				html = processMultipleBots(html);
			}
			if (yaml.maths === true) {
				// S'il y a des maths, on doit gérer le Latex avant d'afficher le message
				html = convertLatexExpressions(html);
				setTimeout(() => {
					displayMessage(html, isUser, chatMessage);
				}, 100);
			} else {
				displayMessage(html, isUser, chatMessage);
			}
		}
		if (nextMessage.selected) {
			chatbotResponse(nextMessage.selected);
		}
	}

	const LEVENSHTEIN_THRESHOLD = 3; // Seuil de similarité (tolérance des fautes d'orthographe et des fautes de frappe)
	const MATCH_SCORE_IDENTITY = 5; // Pour régler le fait de privilégier l'identité d'un keyword à la simple similarité
	const BESTMATCH_THRESHOLD = 0.545; // Seuil pour que le bestMatch soit pertinent
	const WORD_LENGTH_FACTOR = 0.1; // Prise en compte de la taille des keywords (plus les keywords sont grands, plus ils doivent avoir un poids important)

	function responseToSelectedOption(optionLink) {
		// Gestion de la réponse à envoyer si on sélectionne une des options proposées
		if (optionLink != "") {
			for (let i = 0; i < chatDataLength; i++) {
				let title = chatData[i][0];
				title = yaml.obfuscate ? btoa(title) : title;
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
	if (yaml.searchInContent || yaml.useLLM.url) {
		for (let i = 0; i < chatDataLength; i++) {
			const responses = chatData[i][2];
			let response = Array.isArray(responses)
				? responses.join(" ").toLowerCase()
				: responses.toLowerCase();
			const titleResponse = chatData[i][0];
			response = titleResponse + " " + response;
			const vectorResponse = createVector(response, titleResponse);
			vectorChatBotResponses.push(vectorResponse);
		}
	}

	if (yaml.useLLM.url && yaml.useLLM.RAGinformations) {
		getRAGcontent(yaml.useLLM.RAGinformations);
	}

	function chatbotResponse(inputText) {
		// Cas où on va directement à un prochain message (sans même avoir à tester la présence de keywords)
		if (nextMessage.goto != "" && !nextMessage.onlyIfKeywords) {
			inputText = nextMessage.goto;
		}
		let RAGbestMatchesInformation = "";
		let questionToLLM;
		if (yaml.useLLM.url) {
			inputText = inputText.replace(
				'<span class="hidden">!useLLM</span>',
				"!useLLM",
			);
			questionToLLM = inputText.trim().replace("!useLLM", "");
			if (yaml.useLLM.RAGinformations) {
				// On ne retient dans les informations RAG que les informations pertinentes par rapport à la demande de l'utilisateur
				const cosSimArray = vectorRAGinformations.map((vectorRAGinformation) =>
					cosineSimilarity(questionToLLM, vectorRAGinformation),
				);
				const RAGbestMatchesIndexes = topElements(
					cosSimArray,
					yaml.useLLM.RAGmaxTopElements,
				);
				RAGbestMatchesInformation = RAGbestMatchesIndexes.map(
					(element) => RAGcontent[element[1]],
				).join("\n");
			}
		}

		// Choix de la réponse que le chatbot va envoyer
		if (yaml.detectBadWords === true && filterBadWords) {
			if (filterBadWords.check(inputText)) {
				createChatMessage(getRandomElement(config.badWordsMessage), false);
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
				},
			);
			indexLastResponseKeyMatch = optionsLastResponseKeysToLowerCase.indexOf(
				userInputTextToLowerCase,
			);
		}

		if (optionsLastResponse && indexLastResponseKeyMatch > -1) {
			// Si le message de l'utilisateur correspond à une des options proposées, on renvoie directement vers cette option
			const optionLink = optionsLastResponse[indexLastResponseKeyMatch][1];
			responseToSelectedOption(optionLink);
		} else {
			/* Sinon, on cherche la meilleure réponse possible en testant l'identité ou la similarité entre les mots ou expressions clés de chaque réponse possible et le message envoyé */
			for (let i = 0; i < chatDataLength; i++) {
				const titleResponse = chatData[i][0];
				const keywordsResponse = chatData[i][1];
				// Si on a la directive !Next, on teste seulement la similarité avec la réponse indiquée dans !Next et on saute toutes les autres réponses
				if (nextMessage.onlyIfKeywords && titleResponse != nextMessage.goto) {
					continue;
				}
				// Si on a la directive !Next, alors si la réponse à tester ne contient pas de conditions, on va directement vers cette réponse
				if (
					nextMessage.onlyIfKeywords &&
					titleResponse == nextMessage.goto &&
					keywordsResponse.length == 0
				) {
					userInputTextToLowerCase = nextMessage.goto.toLowerCase();
				}
				const keywords = keywordsResponse
					.concat(titleResponse)
					.map((keyword) => keyword.toLowerCase());
				const responses = chatData[i][2];
				let matchScore = 0;
				let distanceScore = 0;
				if (yaml.searchInContent) {
					const cosSim = cosineSimilarity(
						userInputTextToLowerCase,
						vectorChatBotResponses[i],
					);
					matchScore = matchScore + cosSim + 0.5;
				}
				for (let keyword of keywords) {
					if (userInputTextToLowerCase.includes(keyword)) {
						// Test de l'identité stricte
						let strictIdentityMatch = false;
						if (nextMessage.onlyIfKeywords) {
							// Si on utilise la directive !Next, on vérifie que le keyword n'est pas entouré de lettres ou de chiffres dans le message de l'utilisateur
							userInputTextToLowerCase = removeAccents(
								userInputTextToLowerCase,
							);
							keyword = removeAccents(keyword);
							const regexStrictIdentityMatch = new RegExp(`\\b${keyword}\\b`);
							if (regexStrictIdentityMatch.test(userInputTextToLowerCase)) {
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
					} else if (userInputTextToLowerCase.length > 4) {
						// Sinon : test de la similarité (seulement si le message de l'utilisateur n'est pas très court)
						const isNegativeKeyword = keyword.startsWith("! ");
						keyword = keyword.replace(/^\! /, "");
						const levenshteinDistance = hasLevenshteinDistanceLessThan(
							userInputTextToLowerCase,
							keyword,
							LEVENSHTEIN_THRESHOLD,
							WORD_LENGTH_FACTOR,
						);
						distanceScore = isNegativeKeyword
							? distanceScore - levenshteinDistance
							: distanceScore + levenshteinDistance;
					}
				}
				if (distanceScore < 0) {
					matchScore = 0;
				}
				if (
					(matchScore == 0 || yaml.searchInContent) &&
					!nextMessage.onlyIfKeywords
				) {
					// En cas de simple similarité : on monte quand même le score. Mais si on est dans le mode où on va directement à une réponse en testant la présence de keywords, la correspondance doit être stricte, on ne fait pas de calcul de similarité
					if (distanceScore > bestDistanceScore) {
						matchScore = matchScore + distanceScore;
						bestDistanceScore = distanceScore;
					}
				}
				// Si on a la directive !Next : titre réponse, alors on augmente de manière importante le matchScore si on a un matchScore > 0 et que la réponse correspond au titre de la réponse voulue dans la directive
				if (
					matchScore > 0 &&
					nextMessage.onlyIfKeywords &&
					titleResponse == nextMessage.goto
				) {
					matchScore = matchScore + MATCH_SCORE_IDENTITY;
				}
				if (matchScore == 0) {
					matchScore =
						longestCommonSubstring(
							userInputTextToLowerCase,
							keywords.join(" "),
						) * WORD_LENGTH_FACTOR;
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
				nextMessage.onlyIfKeywords
			) {
				if (bestMatch && nextMessage.onlyIfKeywords) {
					// Réinitialiser si on a trouvé la bonne réponse après une directive !Next
					nextMessage.lastMessageFromBot = "";
					nextMessage.goto = "";
					nextMessage.errorsCounter = 0;
					nextMessage.onlyIfKeywords = false;
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
				let selectedResponseWithOptions;
				if (nextMessage.onlyIfKeywords && titleBestMatch !== nextMessage.goto) {
					selectedResponseWithOptions = nextMessage.lastMessageFromBot.includes(
						nextMessage.messageIfKeywordsNotFound,
					)
						? nextMessage.lastMessageFromBot
						: nextMessage.messageIfKeywordsNotFound +
							nextMessage.lastMessageFromBot;
				} else {
					selectedResponseWithOptions = gestionOptions(
						selectedResponseWithoutOptions,
						optionsSelectedResponse,
					);
				}
				// Si on a dans le yaml useLLM avec le paramètre `always: true` OU BIEN si on utilise la directive !useLLM dans l'input, on utilise un LLM pour répondre à la question
				if (
					(yaml.useLLM.url && yaml.useLLM.model && yaml.useLLM.always) ||
					inputText.includes("!useLLM")
				) {
					getAnswerFromLLM(
						questionToLLM.trim(),
						selectedResponseWithoutOptions + "\n" + RAGbestMatchesInformation,
					);
					return;
				} else {
					createChatMessage(selectedResponseWithOptions, false);
				}
			} else {
				if (
					(yaml.useLLM.url && yaml.useLLM.model && yaml.useLLM.always) ||
					inputText.includes("!useLLM")
				) {
					getAnswerFromLLM(questionToLLM, RAGbestMatchesInformation);
					return;
				} else {
					// En cas de correspondance non trouvée, on envoie un message par défaut (sélectionné au hasard dans la liste définie par defaultMessage)
					// On fait en sorte que le message par défaut envoyé ne soit pas le même que les derniers messages par défaut envoyés
					while (
						randomDefaultMessageIndexLastChoice.includes(
							randomDefaultMessageIndex,
						)
					) {
						randomDefaultMessageIndex = Math.floor(
							Math.random() * config.defaultMessage.length,
						);
					}
					if (randomDefaultMessageIndexLastChoice.length > 4) {
						randomDefaultMessageIndexLastChoice.shift();
					}
					randomDefaultMessageIndexLastChoice.push(randomDefaultMessageIndex);
					let messageNoAnswer =
						config.defaultMessage[randomDefaultMessageIndex];
					if (yaml.useLLM.url && yaml.useLLM.model && !yaml.useLLM.always) {
						const optionMessageNoAnswer = [
							[
								"Voir une réponse générée par une IA",
								"!useLLM " + inputText.replaceAll('"', "“"),
							],
						];
						messageNoAnswer = gestionOptions(
							messageNoAnswer,
							optionMessageNoAnswer,
						);
					}
					createChatMessage(messageNoAnswer, false);
				}
			}
		}
	}

	function gestionOptions(response, options) {
		// Si on a du contenu dynamique et qu'on utilise <!-- if @VARIABLE==VALEUR … --> on filtre d'abord les options si elles dépendent d'une variable
		if (yaml.dynamicContent && Object.keys(dynamicVariables).length > 0) {
			if (options) {
				options = options.filter((element) => {
					let condition = element[3];
					if (!condition) {
						return true;
					} else {
						// Remplace les variables personnalisées dans la condition
						condition = condition.replace(
							/@([^\s()&|!=<>]+)/g,
							function (match, varName) {
								return (
									'tryConvertStringToNumber(dynamicVariables["' +
									varName.trim() +
									'"])'
								);
							},
						);
						// Gestion des valeurs si elles ne sont pas mises entre guillemets + gestion du cas undefined
						condition = condition
							.replaceAll(
								/(==|!=|<=|>=|<|>) ?(.*?) ?(\)|&|\||$)/g,
								function (
									match,
									comparisonSignLeft,
									value,
									comparisonSignRight,
								) {
									return `${comparisonSignLeft}"${value}" ${comparisonSignRight}`;
								},
							)
							.replaceAll('""', '"')
							.replace('"undefined"', "undefined");
						return evaluateExpression(condition, dynamicVariables);
					}
				});
			}
		}

		// S'il y a la directive !Select: x on sélectionne aléatoirement seulement x options dans l'ensemble des options disponibles
		[response, options] = processDirectiveSelect(response, options);

		// On teste s'il faut mettre de l'aléatoire dans les options
		if (shouldBeRandomized(options)) {
			options = randomizeArrayWithFixedElements(options);
		}
		if (options) {
			optionsLastResponse = options;
			// Gestion du cas où il y a un choix possible entre différentes options après la réponse du chatbot
			let messageOptions = '\n<ul class="messageOptions">';
			const optionsLength = options.length;
			for (let i = 0; i < optionsLength; i++) {
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
				which: 13,
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
				// Si on clique sur un lien après une directive !Next, on réinitalise les variables lastMessageFromBot, nextMessage.goto et nextMessage.onlyIfKeywords
				nextMessage.lastMessageFromBot = "";
				nextMessage.goto = "";
				nextMessage.onlyIfKeywords = false;
				let messageFromLink = target.innerText;
				// Si on a utilisé la directive !useLLM dans le lien d'un bouton : on renvoie vers une réponse par un LLM
				const linkDeobfuscated = yaml.obfuscate
					? atob(link.replace("#", ""))
					: link;
				if (
					yaml.useLLM.url &&
					yaml.useLLM.model &&
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
				// Si on clique sur un lien après une directive !Next, on réinitalise le compteur d'erreurs
				nextMessage.errorsCounter = 0;
				scrollWindow();
			}
		}
	}

	chatContainer.addEventListener("click", (event) => handleClick(event));

	// Envoi du message d'accueil du chatbot
	initialMessage = gestionOptions(
		initialMessage[0].join("\n"),
		initialMessage[1],
	);

	if (yaml.dynamicContent) {
		// S'il y a des variables dynamiques dans le message initial, on les traite
		initialMessage = processDynamicVariables(
			initialMessage,
			dynamicVariables,
			false,
		);
	}

	createChatMessage(initialMessage, false);
	initialMessage = initialMessage.replace(
		/<span class="unique">.*?<\/span>/,
		"",
	); // S'il y a un élément dans le message initial qui ne doit apparaître que la première fois qu'il est affiché, alors on supprime cet élément pour les prochaines fois
}
