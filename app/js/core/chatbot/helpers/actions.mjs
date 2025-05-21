import { createMessage } from "../../messages/createMessage.mjs";
import { getChatbotResponse } from "../../interactions/getChatbotResponse.mjs";
import { removeAccents } from "../../../utils/nlp.mjs";
import { decodeString } from "../../../utils/strings.mjs";

export async function processActions(chatbot, yaml, hasActions) {
	const actions = hasActions.split("|");
	// Pour chaque action …
	for (let index = 0; index < actions.length; index++) {
		const action = actions[index];
		// On récupère les informations  de l'action (type et données)
		const separator = action.indexOf(":");
		const actionType = action.slice(0, separator);
		const actionData = action.slice(separator + 1).trim();
		const isLast = index === actions.length - 1;

		// Si l'action consiste à entrer un message dans la zone de texte
		if (actionType == "e") {
			// On affiche ce message
			const userMessage = actionData;
			await createMessage(chatbot, userMessage, { isUser: true });
			// Puis on affiche la réponse, sans typewriter sauf si on en est à la dernière action
			const response = getChatbotResponse(chatbot, userMessage);
			if (response) {
				await createMessage(chatbot, response, {
					isUser: false,
					disableTypewriter: !isLast,
				});
			}
		}

		// Si l'action consiste à cliquer sur un bouton de réponse
		if (actionType == "c") {
			// On récupère les boutons de réponse
			const choiceOptions = document.querySelectorAll(".messageOptions li a");
			let choiceArray = Array.from(choiceOptions);
			const selectChoiceOptionByPosition = /^n\d+$/.test(actionData);
			let selectedChoiceOption;
			if (selectChoiceOptionByPosition) {
				// Première possibilité : on identifie un bouton de réponse par son numéro parmi l'ensemble des boutons de réponse affichées
				const choiceOptionPosition = actionData.replace("n", "");
				selectedChoiceOption = choiceArray[choiceOptionPosition - 1];
			} else {
				// Deuxième possibilité : on identifie un bouton de réponse, en cherchant le bouton de réponse, en partant des derniers, qui contient le contenu d'un texte à chercher
				// On met la liste dans le sens inverse pour pouvoir chercher en premier dans les dernières options affichées
				choiceArray = choiceArray.reverse();
				// On fait la recherche sans prendre en compte les accents et les majuscules
				const actionDataNormalized = removeAccents(actionData.toLowerCase());
				selectedChoiceOption = choiceArray.find((option) =>
					removeAccents(option.innerHTML.toLowerCase()).includes(
						actionDataNormalized,
					),
				);
			}

			// Si on a trouvé un bouton de réponse qui correspond
			if (selectedChoiceOption) {
				// On récupère le message à afficher
				const messageToDisplay = selectedChoiceOption.innerHTML;
				// Et le message à envoyer au chatbot
				let messageToChatbot = selectedChoiceOption
					.getAttribute("href")
					.replace("#", "");
				// Si on utilise l'obfuscation, il faut décoder le message
				messageToChatbot = yaml.obfuscate
					? atob(messageToChatbot)
					: messageToChatbot;
				// On affiche le message à afficher côté utilisateur
				await createMessage(chatbot, messageToDisplay, { isUser: true });
				// On récupère puis affiche la répones du chatbot
				const response = getChatbotResponse(chatbot, messageToChatbot);
				if (response) {
					await createMessage(chatbot, response, {
						isUser: false,
						disableTypewriter: !isLast,
					});
				}
			}
		}

		if (actionType == "llmq") {
			const userMessage = decodeString(actionData);
			await createMessage(chatbot, userMessage, { isUser: true });
		}

		if (actionType == "llmr") {
			const botMessage = decodeString(actionData);
			await createMessage(chatbot, botMessage, {
				isUser: false,
				disableTypewriter: !isLast,
			});
		}
	}
}
