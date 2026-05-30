import { handleBotMessage } from "./variablesDynamic/handleBotMessage.mjs";
import { handleUserMessage } from "./variablesDynamic/handleUserMessage.mjs";

let getLastMessage = false;

let stateDynamicVariables = [];
let id = 0;

// Fonction pour remettre les variables dynamiques dans l'état où elles étaient pour un message donné
export function resetDynamicVariablesForMessage(messageId) {
	id = messageId; // On remet l'id à celui du message sur lequel on revient
	if (stateDynamicVariables[messageId]) {
		const { dynamicVariables } = stateDynamicVariables[messageId];
		return dynamicVariables;
	}
	return {};
}

// Traitement des variables dynamiques dans les messages du chatbot
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
	// On enregistre l'état des dynamiques variables pour le message actuel
	stateDynamicVariables[id] = {
		dynamicVariables: { ...dynamicVariables },
	};
	id++;
	return message;
}
