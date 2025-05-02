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
	if (yaml && yaml.useLLM.url && yaml.useLLM.model && !yaml.useLLM.always) {
		const optionDefaultMessage = [
			[
				"Voir une réponse générée par une IA",
				"!useLLM " + inputText.replaceAll('"', "“"),
			],
		];
		defaultMessage = processMessageWithChoiceOptions(
			chatbot,
			defaultMessage,
			optionDefaultMessage,
		);
	}
	return defaultMessage;
}
