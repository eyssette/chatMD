import { config } from "./config.js";
import jsYaml from "./externals/js-yaml.js"
import { loadScript, loadCSS, deepMerge, footerElement, hideFooter } from "./utils.js";

export let yaml = {
	'addOns': config.yaml.addOns,
	'avatar': config.yaml.avatar,
	'bots': config.yaml.bots,
	'detectBadWords': config.yaml.detectBadWords,
	'defaultMessage': config.yaml.defaultMessage,
	'dynamicContent': config.yaml.dynamicContent,
	'favicon': config.yaml.favicon,
	'footer': config.yaml.footer,
	'maths': config.yaml.maths,
	'obfuscate': config.yaml.obfuscate,
	'responsesTitles': config.yaml.responsesTitles,
	'searchInContent': config.yaml.searchInContent,
	'style': config.yaml.style,
	'theme': config.yaml.theme,
	'typeWriter': config.yaml.typeWriter,
	'useLLM': config.yaml.useLLM,
	'userInput': config.yaml.userInput,
	'variables': config.yaml.variables,
}

export let filterBadWords;
export function processYAML(markdownContent) {
	if (markdownContent.split("---").length > 2 && markdownContent.startsWith("---")) {
		try {
			// Traitement des propriétés dans le YAML
			const yamlData = jsYaml.load(markdownContent.split("---")[1]);
			yaml = yamlData ? deepMerge(yaml,yamlData) : yaml;
			if (yaml.maths === true) {
				yaml.addOns = yaml.addOns ? yaml.addOns + ",textFit" : "textFit";
				Promise.all([
					loadScript(
						"https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"
					),
					loadCSS(
						"https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
					),
				]);
			}
			if (yaml.addOns) {
				// Gestion des addOns (scripts et css en plus)
				yaml.addOns = yaml.addOns.replace(' ','').split(",");
				let addOnsDependenciesArray = []
				// On ajoute aussi les dépendances pour chaque addOn
				for (const [addOn, addOnDependencies] of Object.entries(config.addOnsDependencies)) {
					if(yaml.addOns.includes(addOn)) {
						for (const addOnDependencie of addOnDependencies) {
							addOnsDependenciesArray.push(addOnDependencie)
						}
					}
				}
				yaml.addOns.push(...addOnsDependenciesArray)
				// Pour chaque addOn, on charge le JS ou le CSS correspondant
				for (const desiredAddOn of yaml.addOns) {
					const addOnsPromises = [];
					const addDesiredAddOn = config.allowedAddOns[desiredAddOn]
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
			if (yaml.titresRéponses || yaml.responsesTitles) {
				yaml.responsesTitles = yaml.titresRéponses ? yaml.titresRéponses : yaml.responsesTitles;
				if (typeof yaml.responsesTitles === 'string') {
					// Cas où le yaml pour les titres des réponses ne contient pas un tableau, mais un seul élément
					yaml.responsesTitles = [yaml.responsesTitles];
				}
			}
			if (yaml.style) {
				const styleElement = document.createElement("style");
				styleElement.innerHTML = yaml.style;
				document.body.appendChild(styleElement);
			}
			if (
				yaml.userInput ||
				yaml.clavier ||
				yaml.keyboard
			) {
				yaml.userInput = yaml.clavier ? yaml.clavier : (yaml.keyboard ? yaml.keyboard : yaml.userInput);
				if (yaml.userInput === false) {
					document.body.classList.add('hideControls')
				}
			}
			if (yaml.searchInContent || yaml.rechercheContenu) {
				yaml.searchInContent = yaml.rechercheContenu ? yaml.rechercheContenu : yaml.searchInContent;
			}
			if (yaml.gestionGrosMots || yaml.detectBadWords) {
				yaml.detectBadWords = yaml.gestionGrosMots ? yaml.gestionGrosMots : yaml.detectBadWords;
				if (yaml.detectBadWords === true) {
					Promise.all([
						loadScript("js/externals/leo-profanity.js"),
						loadScript("js/externals/badWords-fr.js"),
					])
						.then(() => {
							// Les deux scripts sont chargés et prêts à être utilisés
							filterBadWords = window.LeoProfanity;
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
			if (yaml.favicon) {
				const faviconElement = document.getElementById("favicon");
				faviconElement.href=yaml.favicon;
			}
			if (yaml.avatar) {
				const avatarCSS = `
					.bot-message > :first-child:before {
					background-image: url("${yaml.avatar}");
				`;
				const avatarStyleElement = document.createElement('style');
				avatarStyleElement.textContent = avatarCSS;
				document.head.appendChild(avatarStyleElement);
			}
			if (yaml.defaultMessage || yaml.messageParDéfaut) {
				config.defaultMessage = yaml.messageParDéfaut ? yaml.messageParDéfaut : yaml.defaultMessage;
				while (config.defaultMessage.length<5) {
					config.defaultMessage.push(...config.defaultMessage);
				}
			}
			if(yaml.footer === false) {
				hideFooter();
			} else if (typeof yaml.footer == 'string') {
				footerElement.innerHTML = yaml.footer
			}
			if (yaml.theme) {
				const cssFile = yaml.theme.endsWith('.css') ? "css/themes/"+yaml.theme : "css/themes/"+yaml.theme+".css";
				loadCSS(cssFile);
			}
			if (yaml.dynamicContent || yaml.contenuDynamique) {
				yaml.dynamicContent = yaml.contenuDynamique ? yaml.contenuDynamique : yaml.dynamicContent;
			}
			if (yaml.typeWriter || yaml.effetDactylo) {
				yaml.typeWriter = yaml.effetDactylo ? yaml.effetDactylo : yaml.typeWriter;
			}
			if (yaml.obfuscate) {
				yaml.obfuscate = yaml.obfuscate ? true : false;
			}
			if (yaml.bots) {
				for (const [botName,botProperties] of Object.entries(yaml.bots)) {
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
			if (yaml.useLLM.url || yaml.utiliserLLM.url) {
				yaml.useLLM = yaml.utiliserLLM ? yaml.utiliserLLM : yaml.useLLM
				yaml.useLLM.RAGinformations = yaml.useLLM.informations ? yaml.useLLM.informations : yaml.useLLM.RAGinformations; 
				yaml.useLLM.RAGmaxTopElements = yaml.useLLM.maxTopElements ? yaml.useLLM.maxTopElements: yaml.useLLM.RAGmaxTopElements;
				yaml.useLLM.RAGseparator = yaml.useLLM.separator ? yaml.useLLM.separator : yaml.useLLM.RAGseparator;
				if(yaml.useLLM.askAPIkey === true) {
					yaml.useLLM.apiKey = prompt("Ce chatbot peut se connecter à une IA pour enrichir les réponses proposées. Entrez votre clé API, puis cliquez sur “OK” pour pouvoir bénéficier de cette fonctionnalité. Sinon, cliquez sur “Annuler”.");
				} else {
					yaml.useLLM.apiKey = yaml.useLLM.askAPIkey ? yaml.useLLM.askAPIkey : ""; // Attention à ne pas diffuser publiuement votre clé API
				}
			}
		} catch (e) {}
	}
}