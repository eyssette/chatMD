let filterBadWords;
let yamlUseLLM;

const controls = document.getElementById("controls");


function getMarkdownContent() {
	// Récupération du markdown externe
	const url = window.location.hash.substring(1).replace(/\?.*/,''); // Récupère l'URL du hashtag sans le #
	if (url !== "") {
		// On traite l'URL pour pouvoir récupérer correctement la source du chatbot
		const urlMD = handleURL(url);
		// Récupération du contenu du fichier
		fetch(urlMD)
			.then((response) => response.text())
			.then((data) => {
				md = data;
				chatData = parseMarkdown(md);
				createChatBot(chatData);
			})
			.catch((error) => console.error(error));
	} else {
		createChatBot(parseMarkdown(md));
	}
}

getMarkdownContent();


function prepareRAGdata(informations, separator) {
	if(separator) {
		if(separator == 'auto') {
			// Une fonction pour découper le texte en morceaux d'environ 600 caractères.
			function splitIntoChunks(text, charLimit = 600) {
				let chunks = [];
				let startIndex = 0;
				while (startIndex < text.length) {
					let endIndex = startIndex + charLimit;
					if (endIndex < text.length) {
						let spaceIndex = text.lastIndexOf(' ', endIndex);
						if (spaceIndex > startIndex) {
							endIndex = spaceIndex;
						}
					}
					chunks.push(text.slice(startIndex, endIndex).trim());
					startIndex = endIndex + 1;
				}
				return chunks;
			}
			return splitIntoChunks(informations);
		} else {
			return yamlUseLLM.separator == 'break' ? informations.split('---').map(element => element.replaceAll('\n',' ').trim()) : informations.split(yamlUseLLM.separator);
		}
	} else {
		return informations.split('\n').filter(line => line.trim() !== '');
	}
}

async function getRAGcontent(informations) {
	if(informations) {
		yamlUseLLMmaxTopElements = yamlUseLLM.maxTopElements ? yamlUseLLM.maxTopElements : 3;
		if(informations.includes('http')) {
			const urlRAGfile = handleURL(informations);
			yamlUseLLMinformations = await fetch(urlRAGfile)
				.then((response) => response.text())
				.then((data) => {
					return prepareRAGdata(data, yamlUseLLM.separator);
				})
		} else {
			if(informations.toString().includes("useFile")) {
				RAGinformations = RAGinformations.trim();
				yamlUseLLMinformations = prepareRAGdata(RAGinformations, yamlUseLLM.separator);
			} else {
				RAGinformations = informations.trim();
				yamlUseLLMinformations = prepareRAGdata(RAGinformations, yamlUseLLM.separator);
			}
			return yamlUseLLMinformations
		}
	}
}

function parseMarkdown(markdownContent) {
	let responsesTitles = ["## "]; // Par défaut les titres des réponses sont définis par des titres en markdown niveau 2
	if (markdownContent.split("---").length > 2 && markdownContent.startsWith("---")) {
		try {
			// Traitement des propriétés dans le YAML
			yamlData = jsyaml.load(markdownContent.split("---")[1]);
			if(yamlData.maths) {
				yamlData.addOns = yamlData.addOns ? yamlData.addOns + ",textFit" : "textFit";
			}
			for (const property in yamlData) {
				if (property == "maths") {
					yamlMaths = yamlData[property];
					if (yamlMaths === true) {
						Promise.all([
							loadScript(
								"https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"
							),
							loadCSS(
								"https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
							),
						]);
					}
				}
				if (property == "addOns") {
					// Gestion des addOns (scripts et css en plus)
					yamlUseAddOns = yamlData[property].replace(' ','').split(",");
					let addOnsDependenciesArray = []
					// On ajoute aussi les dépendances pour chaque addOn
					for (const [addOn, addOnDependencies] of Object.entries(addOnsDependencies)) {
						if(yamlUseAddOns.includes(addOn)) {
							for (const addOnDependencie of addOnDependencies) {
								addOnsDependenciesArray.push(addOnDependencie)
							}
						}
					}
					yamlUseAddOns.push(...addOnsDependenciesArray)
					// Pour chaque addOn, on charge le JS ou le CSS correspondant
					for (const desiredAddOn of yamlUseAddOns) {
						const addOnsPromises = [];
						const addDesiredAddOn = allowedAddOns[desiredAddOn]
						if (addDesiredAddOn) {
							if (addDesiredAddOn.js) {
								addOnsPromises.push(loadScript(addDesiredAddOn.js));
							}
							if (addDesiredAddOn.css) {
								addOnsPromises.push(loadCSS(addDesiredAddOn.css));
							}
							Promise.all(addOnsPromises);
						}
					}
				}
				if (property == "titresRéponses" || property == "responsesTitles") {
					responsesTitles = yamlData[property];
					if (typeof responsesTitles === 'string') {
						// Cas où le yaml pour les titres des réponses ne contient pas un tableau, mais un seul élément
						responsesTitles = [responsesTitles];
					}
				}
				if (property == "style") {
					yamlStyle = yamlData[property];
					const styleElement = document.createElement("style");
					styleElement.innerHTML = yamlStyle;
					document.body.appendChild(styleElement);
				}
				if (
					property == "userInput" ||
					property == "clavier" ||
					property == "keyboard"
				) {
					yamlUserInput = yamlData[property];
					if (yamlUserInput === false) {
						document.body.classList.add('hideControls')
					}
				}
				if (property == "searchInContent" || property == "rechercheContenu") {
					yamlSearchInContent = yamlData[property];
				}
				if (property == "gestionGrosMots" || property == "detectBadWords") {
					yamldetectBadWords = yamlData[property];
					if (yamldetectBadWords === true) {
						Promise.all([
							loadScript("externals/leo-profanity.js"),
							loadScript("externals/badWords-fr.js"),
						])
							.then(() => {
								// Les deux scripts sont chargés et prêts à être utilisés
								filterBadWords = LeoProfanity;
								filterBadWords.add(badWordsFR);
							})
							.catch((error) => {
								console.error(
									"Une erreur s'est produite lors du chargement des scripts :",
									error
								);
							});
					}
				}
				if (property == "avatar") {
					yamlAvatar = yamlData[property];
					const avatarCSS = `
  						.bot-message > :first-child:before {
        				background-image: url("${yamlAvatar}");
					`;
					const avatarStyleElement = document.createElement('style');
					avatarStyleElement.textContent = avatarCSS;
					document.head.appendChild(avatarStyleElement);
				}
				if (property == "defaultMessage" || property == "messageParDéfaut") {
					yamlDefaultMessage = yamlData[property];
					defaultMessage = yamlDefaultMessage;
					while (defaultMessage.length<5) {
						defaultMessage.push(...defaultMessage);
					}
				}
				if (property == "footer") {
					yamlFooter = yamlData[property];
				}
				if (property == "theme") {
					yamlTheme = yamlData[property];
					const cssFile = yamlTheme.endsWith('.css') ? "themes/"+yamlTheme : "themes/"+yamlTheme+".css";
					loadCSS(cssFile);
				}
				if (property == "dynamicContent" || property =="contenuDynamique") {
					yamlDynamicContent = yamlData[property];
				}
				if (property == "typeWriter" || property =="effetDactylo") {
					yamlTypeWriter = yamlData[property];
				}
				if (property == "obfuscate") {
					yamlObfuscate = yamlData[property] ? true : false;
				}
				if (property == "useLLM" || property =="utiliserLLM") {
					// On utilise window.useLLMpromise car on aura besoin de savoir quand la promise sera terminée dans un autre script : chatbot.js, (pour calculer les vecteurs de mot pour le RAG : on a besoin que le fichier RAG.js soit bien chargé)  
					window.useLLMpromise = Promise.all([
						loadScript(
							"LLM/useLLM.js",
						),
						loadScript(
							"LLM/RAG.js",
						)
					]).then(() => {
						window.useLLMragContentPromise = new Promise((resolve, reject) => {
							try {
								const content = getRAGcontent(
									yamlUseLLM.informations
								)
								resolve(content);
							} catch(error) {
								reject(error);
							}
							}
						)
					}
					).catch((error) => console.error(error));
					yamlUseLLM = yamlData[property];
					yamlUseLLMurl = yamlUseLLM.url;
					if(yamlUseLLM.askAPIkey === true) {
						yamlUseLLMapiKey = prompt("Ce chatbot peut se connecter à une IA pour enrichir les réponses proposées. Entrez votre clé API, puis cliquez sur “OK” pour pouvoir bénéficier de cette fonctionnalité. Sinon, cliquez sur “Annuler”.");
					} else {
						yamlUseLLMapiKey = yamlUseLLM.askAPIkey ? yamlUseLLM.askAPIkey : ""; // Attention à ne pas diffuser publiuement votre clé API
					}
					yamlUseLLMmodel = yamlUseLLM.model;
					yamlUseLLMalways = yamlUseLLM.always;
					yamlUseLLMsystemPrompt = yamlUseLLM.systemPrompt ? yamlUseLLM.systemPrompt : defaultSystemPrompt;
					yamlUseLLMpostprompt = yamlUseLLM.postprompt ? yamlUseLLM.postprompt : defaultPostprompt;
					yamlUseLLMpreprompt = yamlUseLLM.preprompt ? yamlUseLLM.preprompt : '';
					yamlUseLLMmaxTokens = yamlUseLLM.maxTokens ? yamlUseLLM.maxTokens : defaultMaxTokens;
				}
			}
		} catch (e) {}
	}
	
	let chatbotData = [];
	let currentH2Title = null;
	let currentLiItems = [];
	let content = [];
	let lastOrderedList = null;
	const regexOrderedList = /^\d{1,3}(\.|\))\s\[/;
	const regexOrderedListRandom = /^\d{1,3}\)/;
	const regexDynamicContentIfBlock = /\`if (.*?)\`/;
	let listParsed = false;
	let initialMessageContentArray = [];
	let initialMessageOptions = [];
	let randomOrder = false;

	// On récupère le contenu principal sans l'en-tête YAML s'il existe
	let indexFirstH1title = markdownContent.indexOf("# ");
	const indexFirstH2title = markdownContent.indexOf("## ");
	if(indexFirstH2title > -1 && indexFirstH2title == indexFirstH1title - 1) {
		indexFirstH1title = 0;
	}
	let mainContent = markdownContent.substring(indexFirstH1title);
	if(yamlData && yamlData.variables) {
		mainContent = processVariables(mainContent, true)
	}
	const mainContentWithoutH1 = mainContent.substring(1);
	// On récupère la séparation entre la première partie des données (titre + message principal) et la suite avec les réponses possibles
	const possibleTitles = ["# ","## ","### ","#### ","##### "]
	const indexOfFirstTitles = possibleTitles.map(title => mainContentWithoutH1.indexOf(title)).filter(index => index > 0);
	const indexAfterFirstMessage = Math.min(...indexOfFirstTitles);

	// Gestion de la première partie des données : titre + message initial
	const firstPart = mainContent.substring(0,indexAfterFirstMessage);
	// Gestion du titre
	const chatbotTitleMatch = firstPart.match(/# .*/);
	const chatbotTitle = chatbotTitleMatch ? chatbotTitleMatch[0] : "Chatbot";
	const chatbotTitleArray = chatbotTitle ? [chatbotTitle.replace('# ','').trim()] : [""];
	const indexStartTitle = firstPart.indexOf(chatbotTitle);
	// Gestion du message initial
	const initialMessageContent = chatbotTitleMatch ? firstPart.substring(indexStartTitle+chatbotTitle.length) : firstPart.substring(indexStartTitle);
	const initialMessageContentLines = initialMessageContent.split("\n")
	for (let line of initialMessageContentLines) {
		line = line.replace(/^>\s?/, "").trim();
		if (line.match(regexOrderedList)) {
			// Récupération des options dans le message initial, s'il y en a
			randomOrder = regexOrderedListRandom.test(line);
			const listContent = line.replace(/^\d+(\.|\))\s/, "").trim();
			let link = listContent.replace(/^\[.*?\]\(/, "").replace(/\)$/, "");
			link = yamlObfuscate ? btoa(link) : link;
			const text = listContent.replace(/\]\(.*/, "").replace(/^\[/, "");
			initialMessageOptions.push([text, link, randomOrder]);
		} else {
			initialMessageContentArray.push(line);
		}
	}
	
	const contentAfterFirstPart = mainContent.substring(indexAfterFirstMessage);
	const contentAfterFirstPartLines = contentAfterFirstPart.split("\n");
	let ifCondition = '';

	for (let line of contentAfterFirstPartLines) {
		if (startsWithAnyOf(line,responsesTitles)) {
			// Gestion des identifiants de réponse, et début de traitement du contenu de chaque réponse
			if (currentH2Title) {
				chatbotData.push([
					currentH2Title,
					currentLiItems,
					content,
					lastOrderedList,
				]);
			}
			currentH2Title = line.replace(startsWithAnyOf(line,responsesTitles), "").trim(); // Titre h2
			currentLiItems = [];
			lastOrderedList = null;
			listParsed = false;
			content = [];
		} else if (line.startsWith("- ") && !listParsed) {
			// Gestion des listes
			currentLiItems.push(line.replace("- ", "").trim());
		} else if (yamlDynamicContent && line.match(regexDynamicContentIfBlock)) {
			ifCondition = line.match(regexDynamicContentIfBlock)[1] ? line.match(regexDynamicContentIfBlock)[1] : '';
			content.push(line + "\n");
			listParsed = true;
		} else if (yamlDynamicContent && line.match('`endif`')) {
			ifCondition = '';
			content.push(line + "\n");
			listParsed = true;
		} else if (line.match(regexOrderedList)) {
			// Cas des listes ordonnées
			listParsed = false;
			if (!lastOrderedList) {
				lastOrderedList = [];
			}
			randomOrder = regexOrderedListRandom.test(line);
			const listContent = line.replace(/^\d+(\.|\))\s/, "").trim();
			let link = listContent.replace(/^\[.*?\]\(/, "").replace(/\)$/, "");
			link = yamlObfuscate ? btoa(link) : link;
			const text = listContent.replace(/\]\(.*/, "").replace(/^\[/, "");
			lastOrderedList.push([text, link, randomOrder, ifCondition]);
			/* lastOrderedList.push(listContent); */
		} else if (line.length > 0 && !line.startsWith('# ')) {
			// Gestion du reste du contenu (sans prendre en compte les éventuels titres 1 dans le contenu)
			// Possibilité de faire des liens à l'intérieur du contenu vers une réponse
			line = line.replaceAll(/\[(.*)?\]\((#.*?)\)/g,'<a href="$2">$1</a>')
			content.push(line);
			listParsed = true;
		}
	}
	
	chatbotData.push([
		currentH2Title,
		currentLiItems,
		content,
		lastOrderedList,
	]);

	const initialMessage = [initialMessageContentArray, initialMessageOptions];
	chatbotData.push(initialMessage);
	chatbotData.push(chatbotTitleArray);

	return chatbotData;
}
