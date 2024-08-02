import { config } from "./config";
import {jsyaml} from "../externals/js-yaml.min.js"
import { loadScript, loadCSS } from "./utils.js";

export let yaml = {
	'maths': config.yaml.maths,
	'addOns': config.yaml.addOns,
	'style': config.yaml.style,
	'userInput': config.yaml.userInput,
	'responsesTitles': config.responsesTitles,
	'searchInContent': config.yaml.searchInContent,
	'detectBadWords': config.yaml.detectBadWords,
	'avatar': config.yaml.avatar,
	'footer': config.yaml.footer,
	'theme': config.yaml.theme,
	'dynamicContent': config.yaml.dynamicContent,
	'typeWriter': config.yaml.typeWriter,
	'obfuscate': config.yaml.obfuscate,
	'bots': config.yaml.bots,
	'useLLM': config.yaml.useLLM,
	'variables': config.yaml.variables,
}

let filterBadWords;
export function processYAML(markdownContent) {
	if (markdownContent.split("---").length > 2 && markdownContent.startsWith("---")) {
		try {
			// Traitement des propriétés dans le YAML
			const yamlData = jsyaml.load(markdownContent.split("---")[1]);
			yaml = yamlData ? Object.assign(yaml,yamlData) : yaml;
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
				yaml.responsesTitles = yaml.responsesTitles ? yaml.responsesTitles : yaml.titresRéponses;
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
				yaml.userInput = yaml.userInput ? yaml.userInput : (yaml.keyboard ? yaml.keyboard : yaml.clavier);
				if (yaml.userInput === false) {
					document.body.classList.add('hideControls')
				}
			}
			if (yaml.searchInContent || yaml.rechercheContenu) {
				yaml.searchInContent = yaml.searchInContent ? yaml.searchInContent : yaml.rechercheContenu;
			}
			if (yaml.gestionGrosMots || yaml.detectBadWords) {
				yaml.detectBadWords = yaml.detectBadWords ? yaml.detectBadWords : yaml.gestionGrosMots;
				if (yaml.detectBadWords === true) {
					Promise.all([
						loadScript("externals/leo-profanity.js"),
						loadScript("externals/badWords-fr.js"),
					])
						.then(() => {
							// Les deux scripts sont chargés et prêts à être utilisés
							filterBadWords = window.LeoProfanity;
							filterBadWords.add(window.badWordsFR);
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
				config.defaultMessage = yaml.defaultMessage ? yaml.defaultMessage : yaml.messageParDéfaut;
				while (config.defaultMessage.length<5) {
					config.defaultMessage.push(...config.defaultMessage);
				}
			}
			if (yaml.footer) {
				if(yaml.footer === true) {
					document.body.classList.add('hideFooter')
				}
			}
			if (yaml.theme) {
				const cssFile = yaml.theme.endsWith('.css') ? "themes/"+yaml.theme : "themes/"+yaml.theme+".css";
				loadCSS(cssFile);
			}
			if (yaml.dynamicContent || yaml.contenuDynamique) {
				yaml.dynamicContent = yaml.dynamicContent ? yaml.dynamicContent : yaml.contenuDynamique;
			}
			if (yaml.typeWriter || yaml.effetDactylo) {
				yaml.typeWriter = yaml.typeWriter ? yaml.typeWriter : yaml.effetDactylo;
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
			if (yaml.useLLM || yaml.utiliserLLM) {
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
							const content = window.getRAGcontent(
								yaml.useLLM.RAG.informations
							)
							resolve(content);
						} catch(error) {
							reject(error);
						}
						}
					)
				}
				).catch((error) => console.error(error));
				yaml.useLLM.ok = true;
				if(yaml.useLLM.askAPIkey === true) {
					yaml.useLLM.apiKey = prompt("Ce chatbot peut se connecter à une IA pour enrichir les réponses proposées. Entrez votre clé API, puis cliquez sur “OK” pour pouvoir bénéficier de cette fonctionnalité. Sinon, cliquez sur “Annuler”.");
				} else {
					yaml.useLLM.apiKey = yaml.useLLM.askAPIkey ? yaml.useLLM.askAPIkey : ""; // Attention à ne pas diffuser publiuement votre clé API
				}
			}
		} catch (e) {}
	}
}