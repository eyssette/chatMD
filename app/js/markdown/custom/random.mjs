import { getRandomElement } from "../../utils/arrays.mjs";

// Gestion du cas où il y a plusieurs messages possibles de réponse, séparés par "---"
export function processRandomMessage(message) {
	const messageSplitHR = message.split("\n---\n");
	if (messageSplitHR.length > 1) {
		const messageHasChoiceOptions = message.indexOf(
			'<ul class="messageOptions">',
		);
		if (messageHasChoiceOptions > -1) {
			const messageWithoutChoiceOptions = message.substring(
				0,
				messageHasChoiceOptions,
			);
			const messageChoiceOptions = message.substring(messageHasChoiceOptions);
			const messageWithoutChoiceOptionsSplitHR =
				messageWithoutChoiceOptions.split("---");
			message =
				getRandomElement(messageWithoutChoiceOptionsSplitHR) +
				messageChoiceOptions;
		} else {
			message = getRandomElement(messageSplitHR);
		}
	}
	return message;
}
