import { getRandomElement } from "../../utils/arrays.mjs";

// Gestion du cas où il y a plusieurs messages possibles de réponse, séparés par "---"
export function processRandomMessage(message) {
	const SEPARATOR = "\n---\n";
	// Découpe en variantes et ignore les parties vides (espaces / retours à la ligne)
	const messageVariants = message
		.split(SEPARATOR)
		.map((part) => part.trim())
		.filter((part) => part.length > 0);

	if (messageVariants.length > 1) {
		const choiceOptionsIndex = message.indexOf('<ul class="messageOptions">');
		if (choiceOptionsIndex > -1) {
			const baseMessage = message.substring(0, choiceOptionsIndex);
			const choiceOptionsHtml = message.substring(choiceOptionsIndex);
			// On découpe la partie 'baseMessage' en variantes et on ignore les parties vides
			const baseMessageVariants = baseMessage
				.split("---")
				.map((part) => part.trim())
				.filter((part) => part.length > 0);
			if (baseMessageVariants.length > 0) {
				message = getRandomElement(baseMessageVariants) + choiceOptionsHtml;
			}
		} else {
			message = getRandomElement(messageVariants);
		}
	}
	return message;
}
