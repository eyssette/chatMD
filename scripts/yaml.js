let filterBadWords;
function processYAML(markdownContent) {
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
				if (property == "favicon") {
					const faviconElement = document.getElementById("favicon");
					faviconElement.href=yamlData[property];
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
					if(yamlFooter === true) {
						document.body.classList.add('hideFooter')
					}
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
				if (property == "bots") {
					yamlBots = yamlData[property];
					for (const [botName,botProperties] of Object.entries(yamlBots)) {
						const botAvatarCustomImageCSS = botProperties.avatar ? 'background-image:url("' + botProperties.avatar + '"); ' : '';  
						const botAvatarCSSfromYAML = botProperties.cssAvatar ? botProperties.cssAvatar : ''
						const botAvatarCSS =  '.botName-'+botName+'>:first-child:before {'+ botAvatarCustomImageCSS + botAvatarCSSfromYAML +'}'
						const botCSSmessage = botProperties.cssMessage ? botProperties.cssMessage : '';
						const botCSS = '<style>'+botAvatarCSS+' .botName-'+botName+'{'+botCSSmessage+'}</style>'
						Promise.all([
							loadCSS(botCSS)
						])
					}
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
}