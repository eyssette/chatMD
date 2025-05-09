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

const allowedTagsInUserInput = ["<p>", "</p>"];

function handleClickOnSendButton(chatbot) {
	sendButton.addEventListener("click", () => {
		let userInputText = userInput.innerText;
		if (userInputText.trim() !== "") {
			userInputText = sanitizeHtml(userInputText, allowedTagsInUserInput);
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
