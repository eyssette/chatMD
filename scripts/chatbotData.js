const controls = document.getElementById("controls");

function getMarkdownContent() {
	// Récupération du markdown externe
	const url = window.location.hash.substring(1).replace(/\?.*/,''); // Récupère l'URL du hashtag sans le #
	if (url !== "") {
		// On traite l'URL pour pouvoir récupérer correctement la source du chatbot
		const sourceChatBot = handleURL(url);
		if (Array.isArray(sourceChatBot)) {
			// Cas où la source est répartie dans plusieurs fichiers
			const promises = sourceChatBot.map(url => fetch(url).then(data => data.text()));
			Promise.all(promises).then(data => {
				md = data.join("\n");
				chatData = parseMarkdown(md);
				createChatBot(chatData);
			}).catch((error) => console.error(error));
		} else {
			// Récupération du contenu du fichier
			fetch(sourceChatBot)
			.then((response) => response.text())
			.then((data) => {
				md = data;
				chatData = parseMarkdown(md);
				createChatBot(chatData);
			}).catch((error) => console.error(error));
		}
	} else {
		createChatBot(parseMarkdown(md));
	}
}

getMarkdownContent();

function parseMarkdown(markdownContent) {
	processYAML(markdownContent)
	
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
		mainContent = processFixedVariables(mainContent, true)
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
			line = line.replaceAll(/\[(.*?)\]\((#.*?)\)/g,'<a href="$2">$1</a>')
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
