import { createMessage } from "../../messages/createMessage.mjs";
import { getChatbotResponse } from "../../interactions/getChatbotResponse.mjs";
import { removeAccents } from "../../../utils/nlp.mjs";
import { decodeString, deobfuscateString } from "../../../utils/strings.mjs";

async function waitForChoiceOption(number, timeout = 1000) {
	return new Promise((resolve, reject) => {
		const start = Date.now();
		const checkOptions = () => {
			const choiceOptions = document.querySelectorAll(".messageOptions li a");
			if (choiceOptions.length >= number) {
				resolve(choiceOptions);
			} else if (Date.now() - start >= timeout) {
				reject(new Error("Timeout: options not found within time limit."));
			} else {
				setTimeout(checkOptions, 100);
			}
		};
		checkOptions();
	});
}

async function waitForSelectedChoiceOption(
	actionDataNormalized,
	timeout = 1000,
) {
	const start = Date.now();
	return new Promise((resolve, reject) => {
		const tryFindSelectedChoiceOption = () => {
			const choiceOptions = document.querySelectorAll(".messageOptions li a");
			let choiceArray = Array.from(choiceOptions);
			// On met la liste dans le sens inverse pour pouvoir chercher en premier dans les dernières options affichées
			choiceArray = choiceArray.reverse();
			const selectedChoiceOption = choiceArray.find((option) =>
				removeAccents(option.innerHTML.toLowerCase()).includes(
					actionDataNormalized,
				),
			);

			if (selectedChoiceOption) {
				resolve(selectedChoiceOption);
			} else if (Date.now() - start >= timeout) {
				reject(new Error("Timeout: No matching choice option found."));
			} else {
				setTimeout(tryFindSelectedChoiceOption, 100);
			}
		};

		tryFindSelectedChoiceOption();
	});
}

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
			const userMessage =
				yaml && yaml.obfuscate ? deobfuscateString(actionData) : actionData;
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
			const selectChoiceOptionByPosition = /^n\d+$/.test(actionData);
			let selectedChoiceOption;
			if (selectChoiceOptionByPosition) {
				// Première possibilité : on identifie un bouton de réponse par son numéro parmi l'ensemble des boutons de réponse affichées
				const choiceOptionPosition = parseInt(actionData.replace("n", ""));
				const choiceOptions = await waitForChoiceOption(choiceOptionPosition);
				let choiceArray = Array.from(choiceOptions);
				selectedChoiceOption = choiceArray[choiceOptionPosition - 1];
			} else {
				// Deuxième possibilité : on identifie un bouton de réponse, en cherchant le bouton de réponse, en partant des derniers, qui contient le contenu d'un texte à chercher
				// On fait la recherche sans prendre en compte les accents et les majuscules
				const actionDataNormalized = removeAccents(actionData.toLowerCase());
				selectedChoiceOption =
					await waitForSelectedChoiceOption(actionDataNormalized);
			}

			// Si on a trouvé un bouton de réponse qui correspond
			if (selectedChoiceOption) {
				// On récupère le message à afficher
				// Le message peut contenir une assignation de valeur à une variable
				// On récupère le code de cette assignation pour qu'il soit traité
				// lors de la création du message
				const messageToDisplay = selectedChoiceOption.innerHTML.replace(
					/<span class="hidden">(.*?)<\/span>/,
					" $1",
				);
				// Et le message à envoyer au chatbot
				let messageToChatbot = selectedChoiceOption
					.getAttribute("href")
					.replace("#", "");
				// Si on utilise l'obfuscation, il faut décoder le message
				messageToChatbot = yaml.obfuscate
					? deobfuscateString(messageToChatbot)
					: messageToChatbot;
				// On affiche le message à afficher côté utilisateur
				await createMessage(chatbot, messageToDisplay, { isUser: true });
				// On récupère puis affiche la répones du chatbot
				const response = await getChatbotResponse(chatbot, messageToChatbot);
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
