import { getRandomElement } from "../../../utils/arrays.mjs";

// Gestion du cas où il y a plusieurs messages possibles de réponse, séparés par "---"
export function processRandomMessage(message) {
	const messageSplitHR = message.split("\n---\n");
	if (messageSplitHR.length > 1) {
		const messageHasOptions = message.indexOf('<ul class="messageOptions">');
		if (messageHasOptions > -1) {
			const messageWithoutOptions = message.substring(0, messageHasOptions);
			const messageOptions = message.substring(messageHasOptions);
			const messageWithoutOptionsSplitHR = messageWithoutOptions.split("---");
			message = getRandomElement(messageWithoutOptionsSplitHR) + messageOptions;
		} else {
			message = getRandomElement(messageSplitHR);
		}
	}
	return message;
}
