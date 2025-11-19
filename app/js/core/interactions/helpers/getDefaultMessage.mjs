import { config } from "../../../config.mjs";
import { yaml } from "../../../markdown/custom/yaml.mjs";
import { processMessageWithChoiceOptions } from "./choiceOptions.mjs";

let randomDefaultMessageIndex = Math.floor(
	Math.random() * config.defaultMessage.length,
);
let randomDefaultMessageIndexLastChoice = [];

export function getDefaultMessage(chatbot, inputText) {
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
