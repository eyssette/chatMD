import { yaml } from "../../markdown/custom/yaml.mjs";
import { scrollWindow } from "../../utils/ui.mjs";
import { goToNewChatbot } from "../../utils/urls.mjs";
import { sanitizeHtml } from "../../utils/strings.mjs";
import {
	chatContainer,
	sendButton,
	userInput,
} from "../../shared/selectors.mjs";
import { autoFocus } from "../../shared/constants.mjs";
import { createChatMessage } from "../messages/create.mjs";
import { selectBestResponse } from "./selectBestResponse.mjs";
import { responseToSelectedOption } from "./helpers/choiceOptions.mjs";

const allowedTagsInUserInput = ["<p>", "</p>"];

export async function controlEvents(chatbot) {
	// Gestion des événéments js
	sendButton.addEventListener("click", () => {
		let userInputText = userInput.innerText;
		if (userInputText.trim() !== "") {
			userInputText = sanitizeHtml(userInputText, allowedTagsInUserInput);
			createChatMessage(chatbot, userInputText, true);
			setTimeout(() => {
				const response = selectBestResponse(chatbot, userInputText);
				if (response) {
					createChatMessage(chatbot, response, false);
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

	document.addEventListener("keypress", (event) => {
		if (event.key === "Enter") {
			event.preventDefault();
			if (event.target.id == "urlSourceChatbot") {
				const urlNewChatbot = event.target.value.trim();
				goToNewChatbot(urlNewChatbot);
			} else {
				userInput.focus();
				sendButton.click();
				scrollWindow({ scrollMode: "instant" });
			}
		} else if (
			userInput.parentElement.parentElement.classList.contains("hideControls")
		) {
			// Si l'userInput est caché : on désactive l'entrée clavier (sauf pour Enter qui permet toujours d'afficher plus vite la suite)
			event.preventDefault();
		}
	});

	userInput.focus({ preventScroll: true });

	userInput.addEventListener("focus", function () {
		this.classList.remove("placeholder");
	});

	userInput.addEventListener("blur", function () {
		this.classList.add("placeholder");
	});
	function handleClick(event) {
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
					createChatMessage(chatbot, messageFromLink, true);
					const response = selectBestResponse(chatbot, messageFromLink);
					if (response) {
						createChatMessage(chatbot, response, false);
					}
				} else {
					createChatMessage(chatbot, messageFromLink, true);
					const optionLink = link.substring(1);
					const response = responseToSelectedOption(chatbot, optionLink);
					createChatMessage(chatbot, response);
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
	}

	chatContainer.addEventListener("click", (event) => handleClick(event));
}
