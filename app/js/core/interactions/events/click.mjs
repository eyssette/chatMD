import { yaml } from "../../../markdown/custom/yaml.mjs";
import { goToNewChatbot } from "../../../utils/urls.mjs";
import { scrollWindow } from "../../../utils/ui.mjs";
import { sanitizeHtml } from "../../../utils/strings.mjs";
import { createMessage } from "../../messages/createMessage.mjs";
import {
	chatContainer,
	userInput,
	sendButton,
} from "../../../shared/selectors.mjs";
import { autoFocus } from "../../../shared/constants.mjs";
import { responseToSelectedChoiceOption } from "../helpers/choiceOptions.mjs";
import { getChatbotResponse } from "../getChatbotResponse.mjs";
import { showModal } from "./helpers/modal.mjs";
import { getElementFromEnd } from "../../../utils/arrays.mjs";
import { getParamsFromURL } from "../../../utils/urls.mjs";

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
				const response = getChatbotResponse(chatbot, userInputText);
				if (response) {
					createMessage(chatbot, response, { isUser: false });
				}
				scrollWindow({ scrollMode: "instant" });
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
	chatContainer.addEventListener("click", (event) => {
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
			const baseURL = window.location.origin;
			const hash = window.location.hash;
			let baseQuery = getParamsFromURL();
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
			const linkToHistoryOfActions = `<p><a href="${baseURL}${hash}${queryActionsHistory}" target="_blank">Parcours complet de cette conversation</a></p>`;
			const linkToSpecificResponse = hasDynamicVariables
				? ""
				: `<p><a href="${baseURL}${hash}${queryActionsLatest}" target="_blank">Lien direct vers cette réponse</a></p>`;
			const modalContent = `
				<p>Voici des liens pour accéder à l’historique de vos échanges avec ce chatbot :</p>
				${linkToHistoryOfActions}
				${linkToSpecificResponse}`;
			showModal(modalContent);
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
				// Si le lien est vers une option, alors on envoie le message correspondant à cette option
				event.preventDefault();
				// On enregistre l'action "clic sur un bouton de réponse" dans l'historique des actions du chatbot
				const choiceOptions = document.querySelectorAll(".messageOptions li a");
				// On récupère l'index du bouton de réponse sur lequel on a cliqué, parmi l'ensemble des boutons de réponse affichés
				const indexTarget = Array.from(choiceOptions).indexOf(target) + 1;
				chatbot.actions.push("c:n" + indexTarget);
				// Si on clique sur un lien après une directive !Next, on réinitalise les variables lastMessageFromBot, nextMessage.goto et nextMessage.onlyIfKeywords
				chatbot.nextMessage.lastMessageFromBot = "";
				chatbot.nextMessage.goto = "";
				chatbot.nextMessage.onlyIfKeywords = false;
				let messageFromLink = yaml.maths ? target.innerHTML : target.innerText;
				// Si on a utilisé la directive !useLLM dans le lien d'un bouton : on renvoie vers une réponse par un LLM
				const linkDeobfuscated = yaml.obfuscate
					? atob(link.replace("#", ""))
					: link;
				if (
					yaml.useLLM.url &&
					yaml.useLLM.model &&
					linkDeobfuscated.includes("!useLLM")
				) {
					messageFromLink = linkDeobfuscated
						.replace("#", "")
						.replace("!useLLM", '<span class="hidden">!useLLM</span>')
						.trim();
					createMessage(chatbot, messageFromLink, { isUser: true });
					const response = getChatbotResponse(chatbot, messageFromLink);
					if (response) {
						createMessage(chatbot, response, { isUser: false });
					}
				} else {
					createMessage(chatbot, messageFromLink, { isUser: true });
					const optionLink = link.substring(1);
					const response = responseToSelectedChoiceOption(chatbot, optionLink);
					createMessage(chatbot, response, { isUser: false });
					// Supprimer le focus sur le bouton qu'on vient de cliquer
					document.activeElement.blur();
					// Refocaliser sur userInput
					if (autoFocus) {
						userInput.focus();
					}
				}
				// Si on clique sur un lien après une directive !Next, on réinitalise le compteur d'erreurs
				chatbot.nextMessage.errorsCounter = 0;
				scrollWindow({ scrollMode: "instant" });
			}
		}
	});
}

export function setClickListener(chatbot) {
	handleClickOnSendButton(chatbot);
	handleClickOnChatContainer(chatbot);
}
