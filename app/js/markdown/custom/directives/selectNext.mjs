import { getRandomElement } from "../../../utils/arrays.mjs";

// Gestion de la directive !SelectNext pour sélectionner aléatoirement le prochain message du chatbot
export function processDirectiveSelectNext(chatbot, message) {
	message = message.replaceAll(/!SelectNext:(.*)/g, function (match, v1) {
		if (match) {
			const v1Split = v1.split("/");
			chatbot.nextMessage.lastMessageFromBot = "";
			chatbot.nextMessage.goto = "";
			chatbot.nextMessage.needsProcessing = false;
			chatbot.nextMessage.selected = getRandomElement(v1Split).trim();
			return "";
		} else {
			chatbot.nextMessage.selected = "";
		}
	});
	return message;
}
