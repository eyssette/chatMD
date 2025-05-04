import { yaml } from "./yaml.mjs";
import { handleBotMessage } from "./variablesDynamic/handleBotMessage.mjs";
import { handleUserMessage } from "./variablesDynamic/handleUserMessage.mjs";

let getLastMessage = false;

export function processDynamicVariables(
	chatbot,
	message,
	dynamicVariables,
	isUser,
) {
	if (!isUser) {
		// Cas où le message vient du bot
		const [processedMessage, processedGetLastMessage] = handleBotMessage(
			message,
			yaml,
			dynamicVariables,
			getLastMessage,
		);
		message = processedMessage;
		getLastMessage = processedGetLastMessage;
	} else {
		const [processedMessage, processedGetLastMessage] = handleUserMessage(
			chatbot,
			message,
			dynamicVariables,
			getLastMessage,
		);
		message = processedMessage;
		getLastMessage = processedGetLastMessage;
	}
	return message;
}
