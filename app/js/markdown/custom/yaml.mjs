import { config } from "../../config.mjs";
import { load as loadYAML } from "../../lib/js-yaml.js";
import { loadScript, loadCSS } from "../../utils/urls.mjs";
import { deepMerge } from "../../utils/objects.mjs";
import { hideFooter, setContentOfFooter } from "../../utils/ui.mjs";
import { decodeApiKey } from "../../ai/helpers/keyDecoder.mjs";
import {
	sendButton,
	footerElement,
	controlsElement,
} from "../../shared/selectors.mjs";

export let yaml = {
	plugins: config.yaml.plugins,
	avatar: config.yaml.avatar,
	avatarCircle: config.yaml.avatarCircle,
	bots: config.yaml.bots,
	detectBadWords: config.yaml.detectBadWords,
	defaultMessage: config.yaml.defaultMessage,
	dynamicContent: config.yaml.dynamicContent,
	favicon: config.yaml.favicon,
	footer: config.yaml.footer,
	maths: config.yaml.maths,
	obfuscate: config.yaml.obfuscate,
	responsesTitles: config.yaml.responsesTitles,
	searchInContent: config.yaml.searchInContent,
	style: config.yaml.style,
	theme: config.yaml.theme,
	typeWriter: config.yaml.typeWriter,
	useLLM: config.yaml.useLLM,
	userInput: config.yaml.userInput,
	variables: config.yaml.variables,
};

export let filterBadWords;
export function processYAML(markdownContent) {
	if (
		markdownContent.split("---").length > 2 &&
		markdownContent.startsWith("---")
	) {
		try {
			// Traitement des propriétés dans le YAML
			const yamlData = loadYAML(markdownContent.split("---")[1]);
			yaml = yamlData ? deepMerge(yaml, yamlData) : yaml;
			if (yaml.maths === true) {
				yaml.plugins = yaml.plugins
					? yaml.plugins + ",maths,textFit"
					: "maths,textFit";
			}
			if (yaml.plugins || yaml.addOns) {
				// Gestion des plugins (scripts et css en plus)
				yaml.plugins = yaml.addOns
					? yaml.plugins + "," + yaml.addOns
					: yaml.plugins;
				yaml.plugins = yaml.plugins
					.replaceAll(" ", "")
					.split(",")
					.filter((el) => el);
				let pluginDependenciesArray = [];
				// On ajoute aussi les dépendances pour chaque plugin
				for (const [plugin, pluginDependencies] of Object.entries(
					config.pluginDependencies,
				)) {
					if (yaml.plugins.includes(plugin)) {
						for (const dependency of pluginDependencies) {
							pluginDependenciesArray.push(dependency);
						}
					}
				}
				yaml.plugins.push(...pluginDependenciesArray);
				// Pour chaque plugin, on charge le JS ou le CSS correspondant
				for (const desiredPlugin of yaml.plugins) {
					const pluginsPromises = [];
					const addDesiredPlugin = config.allowedPlugins[desiredPlugin];
					if (addDesiredPlugin) {
						if (addDesiredPlugin.js) {
							pluginsPromises.push(loadScript(addDesiredPlugin.js));
						}
						if (addDesiredPlugin.css) {
							pluginsPromises.push(loadCSS(addDesiredPlugin.css));
						}
						Promise.all(pluginsPromises);
					}
				}
			}
			if (yaml.titresRéponses || yaml.responsesTitles) {
				yaml.responsesTitles = yaml.titresRéponses
					? yaml.titresRéponses
					: yaml.responsesTitles;
				if (typeof yaml.responsesTitles === "string") {
					// Cas où le yaml pour les titres des réponses ne contient pas un tableau, mais un seul élément
					yaml.responsesTitles = [yaml.responsesTitles];
				} else if (typeof yaml.responsesTitles == "object") {
					// Cas où le yaml renvoie un objet : conversion en array
					yaml.responsesTitles = Object.values(yaml.responsesTitles);
				}
			}
			if (yaml.style) {
				const styleElement = document.createElement("style");
				styleElement.innerHTML = yaml.style;
				document.body.appendChild(styleElement);
			}
			if (
				yaml.userInput === false ||
				yaml.clavier === false ||
				yaml.keyboard === false
			) {
				yaml.userInput = false;
				document.body.classList.add("hideControls");
				sendButton.innerHTML = "Afficher tout";
			}
			if (yaml.searchInContent || yaml.rechercheContenu) {
				yaml.searchInContent = yaml.rechercheContenu
					? yaml.rechercheContenu
					: yaml.searchInContent;
			}
			if (yaml.gestionGrosMots || yaml.detectBadWords) {
				yaml.detectBadWords = yaml.gestionGrosMots
					? yaml.gestionGrosMots
					: yaml.detectBadWords;
				if (yaml.detectBadWords === true) {
					Promise.all([
						loadScript("js/plugins/leo-profanity.js"),
						loadScript("js/plugins/badWords-fr.js"),
					])
						.then(() => {
							// Les deux scripts sont chargés et prêts à être utilisés
							filterBadWords = window.LeoProfanity;
							// eslint-disable-next-line no-undef
							filterBadWords.add(badWordsFR);
						})
						.catch((error) => {
							console.error(
								"Une erreur s'est produite lors du chargement des scripts :",
								error,
							);
						});
				}
			}
			if (yaml.favicon) {
				const faviconElement = document.getElementById("favicon");
				faviconElement.href = yaml.favicon;
			}
			if (yaml.avatar) {
				const isAvatarCircle = yaml.avatarCircle || yaml.avatarCercle;
				const avatarCircleCSS = isAvatarCircle ? "border-radius:50%;" : "";
				const avatarCSS = `
					.bot-message > :first-child:before {
						background-image: url("${yaml.avatar}");
						${avatarCircleCSS}
					};`;
				const avatarStyleElement = document.createElement("style");
				avatarStyleElement.textContent = avatarCSS;
				document.head.appendChild(avatarStyleElement);
			}
			if (yaml.defaultMessage || yaml.messageParDéfaut) {
				config.defaultMessage = yaml.messageParDéfaut
					? Object.values(yaml.messageParDéfaut)
					: yaml.defaultMessage;
				while (config.defaultMessage.length < 5) {
					config.defaultMessage.push(...config.defaultMessage);
				}
			}
			if (yaml.footer === false) {
				const isUserInputVisible = yaml.userInput;
				hideFooter(footerElement, controlsElement, isUserInputVisible);
			} else if (typeof yaml.footer == "string") {
				setContentOfFooter(footerElement, yaml.footer);
			}
			if (yaml.theme) {
				const cssFile = yaml.theme.endsWith(".css")
					? "css/themes/" + yaml.theme
					: "css/themes/" + yaml.theme + ".css";
				loadCSS(cssFile);
			}
			if (
				yaml.dynamicContent ||
				yaml.contenuDynamique ||
				yaml.dynamicVariables ||
				yaml.variablesDynamiques
			) {
				yaml.dynamicContent =
					yaml.contenuDynamique ||
					yaml.dynamicContent ||
					yaml.dynamicVariables ||
					yaml.variablesDynamiques;
			}
			if (
				yaml.typewriter === false ||
				yaml.typeWriter === false ||
				yaml.effetDactylo === false
			) {
				yaml.typeWriter = false;
			}
			if (yaml.obfuscate) {
				yaml.obfuscate = yaml.obfuscate ? true : false;
			}
			if (yaml.bots) {
				for (const [botName, botProperties] of Object.entries(yaml.bots)) {
					const botAvatarCustomImageCSS = botProperties.avatar
						? 'background-image:url("' + botProperties.avatar + '"); '
						: "";
					const botAvatarCSSfromYAML = botProperties.cssAvatar
						? botProperties.cssAvatar
						: "";
					const botAvatarCSS =
						".botName-" +
						botName +
						">:first-child:before {" +
						botAvatarCustomImageCSS +
						botAvatarCSSfromYAML +
						"}";
					const botCSSmessage = botProperties.cssMessage
						? botProperties.cssMessage
						: "";
					const botCSS =
						"<style>" +
						botAvatarCSS +
						" .botName-" +
						botName +
						"{" +
						botCSSmessage +
						"}</style>";
					Promise.all([loadCSS(botCSS)]);
				}
			}
			if (yaml.useLLM.url || (yaml.utiliserLLM && yaml.utiliserLLM.url)) {
				yaml.useLLM = yaml.utiliserLLM ? yaml.utiliserLLM : yaml.useLLM;
				yaml.useLLM.RAGinformations = yaml.useLLM.informations
					? yaml.useLLM.informations
					: yaml.useLLM.RAGinformations;
				yaml.useLLM.RAGmaxTopElements = yaml.useLLM.maxTopElements
					? yaml.useLLM.maxTopElements
					: yaml.useLLM.RAGmaxTopElements;
				yaml.useLLM.RAGseparator = yaml.useLLM.separator
					? yaml.useLLM.separator
					: yaml.useLLM.RAGseparator;
				if (yaml.useLLM.askAPIkey === true) {
					yaml.useLLM.apiKey = prompt(
						"Ce chatbot peut se connecter à une IA pour enrichir les réponses proposées. Entrez votre clé API, puis cliquez sur “OK” pour pouvoir bénéficier de cette fonctionnalité. Sinon, cliquez sur “Annuler”.",
					);
				} else {
					if (yaml.useLLM.encryptedAPIkey) {
						yaml.useLLM.encryptionMethod = yaml.useLLM.encryptionMethod
							? yaml.useLLM.encryptionMethod
							: "XOR";
						const apiKeyPassword = prompt(
							"Ce chatbot peut se connecter à une IA pour enrichir les réponses proposées. Entrez le mot de passe qui vous a été communiqué, puis cliquez sur “OK” pour pouvoir bénéficier de cette fonctionnalité. Sinon, cliquez sur “Annuler”.",
						);
						yaml.useLLM.apiKey = decodeApiKey(
							yaml.useLLM.encryptedAPIkey,
							apiKeyPassword,
							yaml.useLLM.encryptionMethod,
						);
					} else {
						yaml.useLLM.apiKey =
							// eslint-disable-next-line no-undef
							process && process.env && process.env.LLM_API_KEY // eslint-disable-next-line no-undef
								? process.env.LLM_API_KEY
								: ""; // Attention à ne pas diffuser publiquement votre clé API, il vaut mieux la définir dans une variable d'environnement
					}
				}
			}
		} catch (e) {
			console.log("erreur processYAML : " + e);
		}
	}
	return yaml;
}
