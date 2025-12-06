import { config } from "../../../config.mjs";
import { yaml } from "../../../markdown/custom/yaml.mjs";
import {
	responseToSelectedChoiceOption,
	processMessageWithChoiceOptions,
} from "./choiceOptions.mjs";

let randomDefaultMessageInitialized = false;
let randomDefaultMessageIndex = 0;
let randomDefaultMessageIndexLastChoice = [];

export function getDefaultMessage(chatbot, inputText) {
	let defaultResponse;
	// On vérifie d'abord s'il y a un fallback dans le YAML
	// C'est une option qui permet de rediriger vers une réponse spécifique si aucune autre n'a été trouvée
	if (yaml.fallback) {
		defaultResponse = responseToSelectedChoiceOption(chatbot, yaml.fallback);
	}
	if (defaultResponse) return defaultResponse;

	// S'il n'y a pas de fallback dans le YAML, on choisit un message par défaut
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
	defaultResponse = config.defaultMessage[randomDefaultMessageIndex];

	// Si une réponse n'a pas été trouvée dans la base de réponses en Markdown du chatbot, et qu'on a activé l'option LLM dans le YAML, alors on propose un bouton qui permet, en cliquant dessus, d'avoir une réponse générée par une IA si la configuration le permet
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
		defaultResponse = processMessageWithChoiceOptions(
			chatbot,
			defaultResponse,
			optionDefaultMessage,
		);
	}
	return defaultResponse;
}
