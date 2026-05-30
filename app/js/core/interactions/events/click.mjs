import { yaml } from "../../../markdown/custom/yaml.mjs";
import { goToNewChatbot } from "../../../utils/urls.mjs";
import { deobfuscateString, sanitizeHtml } from "../../../utils/strings.mjs";
import { createMessage } from "../../messages/createMessage.mjs";
import { userInput, sendButton } from "../../../shared/selectors.mjs";
import { autoFocus } from "../../../shared/constants.mjs";
import { responseToSelectedChoiceOption } from "../helpers/choiceOptions.mjs";
import { getChatbotResponse } from "../getChatbotResponse.mjs";
import { showModal } from "./helpers/modal.mjs";
import { getElementFromEnd } from "../../../utils/arrays.mjs";
import { getParamsFromURL } from "../../../utils/urls.mjs";
import { resetDynamicVariablesForMessage } from "../../../markdown/custom/variablesDynamic.mjs";

const allowedTagsInUserInput = ["<p>", "</p>"];

function handleClickOnSendButton(chatbot) {
	sendButton.addEventListener("click", () => {
		let userInputText = userInput.innerText;
		if (userInputText.trim() !== "") {
			userInputText = sanitizeHtml(userInputText, allowedTagsInUserInput);
			// On enregistre l'action "écrire un message" dans l'historique des actions du chatbot
			chatbot.actions.push("e:" + userInputText);
			createMessage(chatbot, userInputText, { isUser: true });
			setTimeout(() => {
				const response = getChatbotResponse(chatbot, userInputText, yaml);
				if (response) {
					createMessage(chatbot, response, { isUser: false });
				}
			}, 100);
			userInput.innerText = "";
		} else {
			const enterEvent = new KeyboardEvent("keypress", {
				key: "Enter",
				keyCode: 13,
				which: 13,
			});
			userInput.dispatchEvent(enterEvent);
		}
	});
}

function handleClickOnChatContainer(chatbot) {
	document.body.addEventListener("click", (event) => {
		let target = event.target;
		// Cas où on a cliqué sur un bouton pour ouvrir un nouveau chatbot
		if (target.id == "openNewChatbot") {
			const urlNewChatbot = target.parentElement
				.querySelector("#urlSourceChatbot")
				.value.trim();
			goToNewChatbot(urlNewChatbot);
			return;
		}
		// Si c'est un bouton "copyCode", on copie le contenu du bloc code dans le presse-papier
		if (target.classList.contains("copyCode")) {
			const copyCodeButton = target;
			const codeBlock = target.parentElement.querySelector("code");
			navigator.clipboard
				.writeText(
					codeBlock.innerText.replaceAll("​", "").replaceAll("\n\n", "\n"),
				)
				.then(() => {
					copyCodeButton.innerText = "Copié !";
					setTimeout(() => (copyCodeButton.innerText = "Copier"), 2000);
				})
				.catch((err) => {
					console.error("Erreur lors de la copie", err);
				});
		}
		// gestion des clics sur le bouton de menu d'une réponse du chatbot
		if (target.classList.contains("messageMenu")) {
			const actionsHistory = target.getAttribute("data-actions-history");
			const actionsHistoryArray = actionsHistory.split("|");
			let actionsLatest = getElementFromEnd(actionsHistoryArray, 1);
			// Si la dernière action était un clic sur un bouton et qu'on veut renvoyer à la dernière réponse, on doit récupérer le contenu du dernier message envoyé pour déclenché cette réponse
			if (actionsLatest.startsWith("c:n")) {
				let idChoiceOption = actionsLatest.replace("c:n", "");
				idChoiceOption = parseInt(idChoiceOption, 10);
				const choiceOptions = document.querySelectorAll(".messageOptions a");
				const selectedChoiceOption = choiceOptions[idChoiceOption - 1];
				const actionMessage = selectedChoiceOption
					.getAttribute("href")
					.replace("#", "");
				actionsLatest = "e:" + actionMessage;
			}
			// Si la dernière action était une réponse d'un LLM, il faut intégrer la question dans l'historique des actions pour ce message
			if (actionsLatest.startsWith("llmr:")) {
				const llmQuestion = getElementFromEnd(actionsHistoryArray, 2);
				actionsLatest = llmQuestion + "|" + actionsLatest;
			}
			const baseURL = window.location.origin + window.location.pathname;
			let hash = window.location.hash;
			let baseQuery = getParamsFromURL();
			// On garde dans le hash seulement l'URL de la source et on supprime les paramètres (qu'on vient de récupérer dans baseQuery)
			// Permet de supprimer les paramètres vides qui restent éventuellement dans l'URL par exemple des fichiers CodiMD (?both, ?edit, ?view)
			hash = hash.replace(/\?.*/, "");
			// On supprime le paramètre "actions" dans l'URL s'il existe
			const params = new URLSearchParams(baseQuery);
			params.delete("actions");
			baseQuery = params.toString();
			const prefixQuery = baseQuery ? baseQuery + "&" : "?";
			const queryActionsHistory = prefixQuery + `actions=${actionsHistory}`;
			const queryActionsLatest = prefixQuery + `actions=${actionsLatest}`;
			// On crée le contenu de la boîte modale et on l'affiche
			const hasDynamicVariables =
				Object.keys(chatbot.dynamicVariables).length > 0;
			const linkToHistoryOfActions = `<li><a href="${baseURL}${hash}${queryActionsHistory}" target="_blank">Parcours complet de cette conversation</a> (jusqu'à ce message)</li>`;
			const linkToSpecificResponse = hasDynamicVariables
				? ""
				: `<li><a href="${baseURL}${hash}${queryActionsLatest}" target="_blank">Lien direct vers cette réponse</a></li>`;
			const modalContent = `
				<p>Voici des liens pour accéder à l’historique de vos échanges avec ce chatbot :</p>
				<ul>
					${linkToHistoryOfActions}
					${linkToSpecificResponse}
				</ul>`;
			showModal(modalContent);
		}
		// Gestion des clics pour déclencher la lecture audio du message du chatbot
		if (target.classList.contains("messageAudio")) {
			const audioButton = target;
			const messageElement = audioButton.closest(".message");
			// On récupère le contenu texte de messageElement, en supprimant le contenu de .messageActions
			const messageText = Array.from(messageElement.childNodes)
				.filter(
					(node) =>
						!node.classList ||
						(!node.classList.contains("messageActions") &&
							!node.classList.contains("hidden")),
				)
				// On ajoute un point en fin de chaque ligne s'il n'y a pas de signe de ponctuation pour que la synthèse vocale fasse une pause à chaque ligne
				.map((node) => node.textContent.trim().replace(/([^.!?:])$/gm, "$1.\n"))
				.join("\n")
				.trim();
			const utterance = new SpeechSynthesisUtterance(messageText);
			speechSynthesis.speak(utterance);
			// L'icône du bouton de lecture audio se transforme en icône pour stopper l'audio pendant la lecture, et redevient une icône de lecture quand la lecture est terminée ou si on clique à nouveau dessus pour mettre en pause
			if (audioButton.innerText === "🔈") {
				audioButton.innerText = "⏹️";
				utterance.onend = () => {
					audioButton.innerText = "🔈";
				};
			} else {
				audioButton.innerText = "🔈";
				speechSynthesis.cancel();
			}
		}
		while (target && target.tagName !== "A") {
			target = target.parentElement;
		}
		if (target) {
			// Gestion du cas où on clique sur un lien
			const currentUrl = window.location.href;
			const link = target.getAttribute("href");
			if (link.startsWith(currentUrl)) {
				// Si le lien est vers un autre chatbot (avec la même url d'origine), alors on ouvre le chatbot dans un autre onglet
				event.preventDefault();
				window.open(link);
			}
			if (link.startsWith("#")) {
				// Si le lien commence par "link:http", alors c'est un lien vers une URL externe, et on l'ouvre dans un nouvel onglet
				if (link.startsWith("#link:http")) {
					event.preventDefault();
					const externalUrl = link.replace("#link:", "");
					window.open(externalUrl);
					return;
				}
				// Si le lien est vers une option, alors on envoie le message correspondant à cette option
				event.preventDefault();
				// On enregistre l'action "clic sur un bouton de réponse" dans l'historique des actions du chatbot
				const choiceOptions = document.querySelectorAll(".messageOptions li a");
				// On récupère l'index du bouton de réponse sur lequel on a cliqué, parmi l'ensemble des boutons de réponse affichés
				const indexTarget = Array.from(choiceOptions).indexOf(target) + 1;
				// Permet de gérer les liens vides (retour au menu initial)
				// dans ce cas, il ne faut pas mettre le numéro du bouton, mais le texte du bouton
				const isBlankTarget = link == "#";
				if (!isBlankTarget) {
					chatbot.actions.push("c:n" + indexTarget);
				} else {
					const actionMessage = choiceOptions[indexTarget - 1].textContent;
					chatbot.actions.push("e:" + actionMessage);
				}
				// Si on clique sur un lien après une directive !Next, on réinitalise les variables lastMessageFromBot, nextMessage.goto et nextMessage.needsProcessing
				chatbot.nextMessage.lastMessageFromBot = "";
				chatbot.nextMessage.goto = "";
				chatbot.nextMessage.needsProcessing = false;

				// Si on a l'option "rewind" dans le YAML, alors on peut revenir à n'importe quel message précédent en cliquant sur un lien, et tous les messages affichés après ce message sont supprimés, pour ne garder que le fil linéaire de la conversation à partir de ce message
				if (yaml.rewind) {
					const messageElement = target.closest(".message");
					const messagesContainer = messageElement.parentElement;
					const messages = Array.from(messagesContainer.children);
					const indexMessage = messages.indexOf(messageElement);
					const lastMessageIndex = messages.length - 1;
					if (indexMessage < lastMessageIndex) {
						// Si on a des messages après le message sur lequel on vient de cliquer, on les supprime
						messages.forEach((message, index) => {
							if (index > indexMessage) {
								message.remove();
							}
						});
						// On réinitialise les variables dynamiques à l'état où elles étaient pour le message sur lequel on vient de cliquer
						// On remet les variables dynamiques à l'état dans lequel elles étaient au niveau du message sur lequel on revient
						chatbot.dynamicVariables =
							resetDynamicVariablesForMessage(indexMessage);
						// On réécrit l'historique des actions du chatbot pour qu'il corresponde au nouvel état de la conversation après le retour en arrière
						const messageMenu = messageElement.querySelector(".messageMenu");
						const actionsHistory = messageMenu
							? messageMenu.getAttribute("data-actions-history")
							: "";
						const lastAction = chatbot.actions[chatbot.actions.length - 1];
						chatbot.actions = actionsHistory.split("|");
						chatbot.actions.push(lastAction);
					}
				}

				// On récupère le contenu du message de l'utilisateur
				let messageFromLink = target.innerHTML;
				// Si on a utilisé la directive !useLLM dans le lien d'un bouton : on renvoie vers une réponse par un LLM
				const linkDeobfuscated = yaml.obfuscate
					? deobfuscateString(link.replace("#", ""))
					: link;
				if (
					yaml.useLLM.url &&
					yaml.useLLM.model &&
					linkDeobfuscated.includes("!useLLM")
				) {
					// On autorise l'utilisation par l'utilisateur de la commande LLM car elle se trouve dans un bouton déjà autorisé par le créateur du chatbot
					chatbot.allowLLMCommands = true;
					messageFromLink = linkDeobfuscated
						.replace("#", "")
						.replace("!useLLM", '<span class="hidden">!useLLM</span>')
						.trim();
					createMessage(chatbot, messageFromLink, { isUser: true });
					const response = getChatbotResponse(chatbot, messageFromLink, yaml);
					if (response) {
						createMessage(chatbot, response, { isUser: false });
					}
				} else {
					createMessage(chatbot, messageFromLink, { isUser: true });
					const optionLink = link.substring(1);
					const response = responseToSelectedChoiceOption(chatbot, optionLink);
					if (response) {
						createMessage(chatbot, response, { isUser: false });
					}
					// Supprimer le focus sur le bouton qu'on vient de cliquer
					document.activeElement.blur();
					// Refocaliser sur userInput
					if (autoFocus) {
						userInput.focus();
					}
				}
				// Si on clique sur un lien après une directive !Next, on réinitalise le compteur d'erreurs
				chatbot.nextMessage.errorsCounter = 0;
			}
		}
	});
}

export function setClickListener(chatbot) {
	handleClickOnSendButton(chatbot);
	handleClickOnChatContainer(chatbot);
}
