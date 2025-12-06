import { config } from "../../../config.mjs";
import { yaml } from "../../../markdown/custom/yaml.mjs";
import { processMessageWithChoiceOptions } from "./choiceOptions.mjs";

let randomDefaultMessageInitialized = false;
let randomDefaultMessageIndex = 0;
let randomDefaultMessageIndexLastChoice = [];

export function getDefaultMessage(chatbot, inputText) {
	// On initialise l'index aléatoire pour que le choix soit aléatoire dès la première fois
	if (!randomDefaultMessageInitialized) {
		randomDefaultMessageIndex = Math.floor(
			Math.random() * config.defaultMessage.length,
		);
		randomDefaultMessageInitialized = true;
	}
	// Sinon on choisit un message par défaut aléatoire parmi la liste définie dans la configuration
	// On évite de répéter plusieurs fois de suite le même message par défaut
	while (
		randomDefaultMessageIndexLastChoice.includes(randomDefaultMessageIndex)
	) {
		randomDefaultMessageIndex = Math.floor(
			Math.random() * config.defaultMessage.length,
		);
	}
	if (randomDefaultMessageIndexLastChoice.length > 4) {
		randomDefaultMessageIndexLastChoice.shift();
	}
	randomDefaultMessageIndexLastChoice.push(randomDefaultMessageIndex);
	let defaultMessage = config.defaultMessage[randomDefaultMessageIndex];

	// Si une réponse n'a pas été trouvée, on propose un bouton qui permet, en cliquant dessus, d'avoir une réponse générée par une IA si la configuration le permet
	if (
		yaml &&
		yaml.useLLM.url &&
		yaml.useLLM.model &&
		!yaml.useLLM.always &&
		!yaml.useLLM.userCanCallLLM === false
	) {
		chatbot.allowLLMCommands = true;
		const optionDefaultMessage = [
			{
				text: "Voir une réponse générée par une IA",
				link: "!useLLM " + inputText.replaceAll('"', "“").trim(),
			},
		];
		defaultMessage = processMessageWithChoiceOptions(
			chatbot,
			defaultMessage,
			optionDefaultMessage,
		);
	}
	return defaultMessage;
}
