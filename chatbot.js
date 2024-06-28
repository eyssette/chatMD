function createChatBot(chatData) {
	const customVariables = {};
	const params1 = Object.fromEntries(
		new URLSearchParams(document.location.search)
	);
	const params2 = Object.fromEntries(
		new URLSearchParams(document.location.hash.replace(/#.*\?/, ""))
	);
	const params = { ...params1, ...params2 };
	// On récupère les paramètres dans l'URL et on les place dans customVariables
	// Si on utilise du contenu dynamique : on pourra utiliser ces variables
	for (const [key, value] of Object.entries(params)) {
		customVariables["GET" + key] = value;
	}
	let nextMessage = "";
	let nextMessageOnlyIfKeywords = false;
	let nextMessageOnlyIfKeywordsCount = 0;
	const nextMessageOnlyIfKeywordsCountMax = 3;
	let messageIfKeywordsNotFound = "";
	let getLastMessage = false;
	let lastMessageFromBot = "";

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
	function markdownToHTML(text) {
		text = text.replaceAll("\n\n|", "|");
		const html = converter.makeHtml(text);
		return html;
	}

	function getRandomElement(array) {
		return array[Math.floor(Math.random() * array.length)];
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
			// On doit conserver les retours à la ligne dans les blocs "pre"
			const contentKeepReturnInCode = slowContent.replaceAll(/(<pre(.|\n)*<\/pre>)/gm,function(match){
				return match.replaceAll('\n','RETURNCHARACTER')
			})
			const contentArray = contentKeepReturnInCode.split("\n");
			// On découpe chaque paragraphe pour pouvoir ensuite l'afficher d'un coup
			const contentArrayFiltered = contentArray.map((element) =>
				element.startsWith(pauseTypeWriter)
					? element.replace(pauseTypeWriter, "").replaceAll('RETURNCHARACTER','\n') + "`"
					: element.endsWith("`")
					? "`" + element.replaceAll('RETURNCHARACTER','\n')
					: "`" + element.replaceAll('RETURNCHARACTER','\n') + "`"
			);
			typed.strings = [contentArrayFiltered.join(" ")];
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
			counter++;
		}

		// Configuration de MutationObserver
		const observerConfig = {
			childList: true,
			subtree: true,
		};

		// S'il y a des options en fin de message, on les fait apparaître d'un coup, sans effet typeWriter
		content = content.replace(
			/(<ul class="messageOptions"\>[\s\S]*<\/ul>)/gm, pauseTypeWriter + "`$1`");

		// Effet machine à écrire
		let mutationObserver;
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

	function processVariables(content) {
		return content.replace(/@{(\S+)}/g, function (match, variableName) {
			if (yamlData && yamlData.variables && yamlData.variables[variableName]) {
				const variableValue = yamlData.variables[variableName];
				const variableValueSplit = variableValue.split("///");
				const variableValueChoice = getRandomElement(variableValueSplit);
				return variableValueChoice;
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
			window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
			yamlTypeWriter === false
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
		let nextSelected;
		// Gestion des variables fixes prédéfinies
		message = processVariables(message);

		// Cas où c'est un message du bot
		if (!isUser) {
			// Gestion du cas où il y a plusieurs messages possibles de réponse, séparés par "---"
			const messageSplitHR = message.split("---");
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
		}

		if (yamlDynamicContent) {
			// Cas où le message vient du bot
			if (!isUser) {

				// On traite le cas des assignations de valeurs à une variable, et on masque dans le texte ces assignations
				message = message.replaceAll(
					/\`@([^\s]*?) ?= ?(?<!@)(.*?)\`/g,
					function (match, variableName, variableValue) {
						if (!match.includes("calc(") && !match.includes("@INPUT")) {
							customVariables[variableName] = variableValue;
							return "";
						} else {
							return match
						}
					}
				);
				// On remplace dans le texte les variables `@nomVariable` par leur valeur
				message = message.replaceAll(/\`@([^\s]*?)\`/g, function (match, variableName) {
					if (match.includes("=")) {
						return match;
					} else {
						return customVariables[variableName] ? customVariables[variableName] : match;
					}
				});
				// Calcul des variables qui dépendent d'autres variables
				message = message.replaceAll(/\`@([^\s]*?) ?= ?calc\((.*)\)\`/g, function (match, variableName, complexExpression) {
					calc = complexExpression.replace(/@(\w+)/g, (matchCalc, variableNameComplexExpression) => {
						return customVariables[variableNameComplexExpression] || matchCalc;
					});
					customVariables[variableName] = calc;
					return "";
				})
				
				// 2e passage pour remplacer dans le texte les variables `@nomVariable` par leur valeur (cas des variables complexes qui viennent d'être définies)
				message = message.replaceAll(/\`@([^\s]*?)\`/g, function (match, variableName) {
					if (match.includes("=")) {
						return match;
					} else {
						return customVariables[variableName] ? customVariables[variableName] : "";
					}
				});
			
				// On masque dans le texte les demandes de définition d'une variable par le prochain Input
				message = message.replaceAll(
					/\`@([^\s]*?) ?= ?@INPUT : (.*)\`/g,
					function (match, variableName, nextAnswer) {
						getLastMessage = match ? [variableName, nextAnswer] : false;
						return "";
					}
				);
				

				// Possibilité d'activer ou de désactiver le clavier au cas par cas
				if (yamlUserInput === false) {
					if (customVariables["KEYBOARD"] == "true") {
						controls.classList.remove('hideControls')
						customVariables["KEYBOARD"] = "false";
					} else {
						controls.classList.add('hideControls')
					}
				} else {
					if (customVariables["KEYBOARD"] == "false") {
						controls.classList.add('hideControls')
						customVariables["KEYBOARD"] = "true";
					} else {
						controls.classList.remove('hideControls')
					}
				}
				// Au lieu de récupérer l'input, on peut récupérer le contenu d'un bouton qui a été cliqué et on assigne alors ce contenu à une variable : pour cela on intègre la variable dans le bouton, et on la masque avec la classe "hidden"
				message = message.replaceAll(
					/ (@[^\s]*?\=.*?)\</g,
					'<span class="hidden">$1</span><'
				);
				message = message.replaceAll(
					/>(@[^\s]*?\=)/g,
					'><span class="hidden">$1</span>'
				);
				// Traitement du cas où on a l'affichage d'un contenu est conditionné par la valeur d'une variable
				message = message.replaceAll(
					/\`if (.*?)\`((\n|.*)*?)\`endif\`/g,
					function (match, condition, content) {
						if (condition) {
							try {
								// Remplace les variables personnalisées dans la condition
								condition = condition.replace(
									/@([^\s()&|!=]+)/g,
									function (match, varName) {
										return 'customVariables["' + varName.trim() + '"]';
									}
								);
								// Gestion des valeurs si elles ne sont pas mises entre guillemets + gestion du cas undefined
								condition = condition
									.replaceAll(/(==|!=|<|>) ?(.*?) ?(\)|\&|\||$)/g, function(match, comparisonSignLeft,value,comparisonSignRight) {
										return `${comparisonSignLeft}"${value}" ${comparisonSignRight}`
									})
									.replaceAll('""', '"')
									.replace('"undefined"', "undefined");
								// Vérifie que l'expression ne contient que les opérateurs autorisés
								const isValid =
									/^(\s*(!|\(|\)|&&|\|\||==|!=|===|!==|<=|>=|<|>|true|false|null|undefined|[0-9]+|[+-]?([0-9]*[.])?[0-9]+|"[^"]*"|'[^']*'|`[^`]*`|[a-zA-Z0-9_]+\[[^\]]+\]|\s+))*\s*$/.test(
										condition
									);
								if (!isValid) {
									throw new Error("Invalid expression");
								} else {
									// Évaluation de la condition de manière sécurisée
									const result = new Function(
										"customVariables",
										"return " + condition
									)(customVariables);
									return result ? content : "";
								}
							} catch (e) {
								console.error("Error evaluating condition:", condition, e);
								return "<!--" + condition + "-->";
							}
						} else {
							return "";
						}
					}
				);
				// On nettoie le message en supprimant les lignes vides en trop
				message = message.replaceAll(/\n\n\n*/g,'\n\n')
			} else {
				// Cas où le message vient de l'utilisateur
				// Traitement du cas où on a dans le message une assignation de variable (qui vient du fait qu'on a cliqué sur une option qui intégrait cette demande d'assignation de variable)
				message = message.replaceAll(
					/@([^\s]*?)\=(.*)/g,
					function (match, variableName, variableValue, offset) {
						customVariables[variableName] = variableValue;
						// S'il n'y avait pas de texte en plus de la valeur de la variable, on garde la valeur de la variable dans le bouton, sinon on l'enlève
						return offset == 0 ? variableValue : "";
					}
				);

				if (getLastMessage) {
					// Si dans le précédent message, on avait demandé à récupérer l'input : on récupère cette input et on le met dans la variable correspondante
					// Puis on renvoie vers le message correspondant
					if (getLastMessage && getLastMessage.length > 0) {
						customVariables[getLastMessage[0]] = message;
						nextMessage = getLastMessage[1];
						getLastMessage = false;
					} else {
						nextMessage = "";
					}
				} else {
					nextMessage = nextMessageOnlyIfKeywords ? nextMessage : "";
				}
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
		console.log("responseToSelectedOption")
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
					console.log("createchatMessageResponseToSelectedOption")
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
				if(nextMessageOnlyIfKeywords && titleResponse != nextMessage) {
					continue
				}
				// Si on a la directive !Next, alors si la réponse à tester ne contient pas de conditions, on va directement vers cette réponse
				if(nextMessageOnlyIfKeywords && titleResponse == nextMessage && keywordsResponse.length == 0) {
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

	function gestionOptions(response, options) {
		// Si on a du contenu dynamique et qu'on utilise <!-- if @VARIABLE==VALEUR --> on filtre d'abord les options si elles dépendent d'une variable
		if (yamlDynamicContent && Object.keys(customVariables).length > 0) {
			if (options) {
				options = options.filter((element) => {
					for (const [key, value] of Object.entries(customVariables)) {
						// Cas où l'option ne dépend d'aucune variable
						if (!element[3]) {
							return true;
						}
						// Cas où l'option dépend d'une variable et où l'option inclut une variable qui est présente dans customVariables
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
		}
	});

	document.addEventListener("keypress", (event) => {
		userInput.focus();
		if (event.key === "Enter") {
			event.preventDefault();
			sendButton.click();
			scrollWindow();
		} else if(userInput.parentElement.parentElement.classList.contains('hideControls')) {
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
					console.log("createchatMessageFromLink")
					createChatMessage(messageFromLink, true);
					const optionLink = link.substring(1);
					responseToSelectedOption(optionLink);
					// Supprimer le focus sur le bouton qu'on vient de cliquer
					document.activeElement.blur()
					// Refocaliser sur userInput
					userInput.focus();
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

	createChatMessage(initialMessage, false);
	initialMessage = initialMessage.replace(
		/<span class=\"unique\">.*?<\/span>/,
		""
	); // S'il y a un élément dans le message initial qui ne doit apparaître que la première fois qu'il est affiché, alors on supprime cet élément pour les prochaines fois
}
