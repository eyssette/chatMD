import { yaml } from "../../markdown/custom/yaml.mjs";
import { scrollWindow } from "../../utils/ui.mjs";
import { getParamsFromURL, goToNewChatbot } from "../../utils/urls.mjs";
import { nextMessage } from "../../markdown/custom/directivesAndBlocks.mjs";
import { markdownToHTML } from "../../markdown/parser.mjs";
import { sanitizeHtml } from "../../utils/strings.mjs";
import { createVector } from "../../utils/nlp.mjs";
import {
	chatContainer,
	sendButton,
	userInput,
} from "../../shared/selectors.mjs";
import { autoFocus } from "../../shared/constants.mjs";
import { createChatMessage } from "../messages/create.mjs";
import { chatbotResponse } from "./selectBestResponse.mjs";
import { responseToSelectedOption, gestionOptions } from "./choiceOptions.mjs";

const allowedTagsInUserInput = [
	"<p>",
	"</p>",
	'<span class="hidden">',
	"</span>",
];

export async function controlChatbot(chatData) {
	let dynamicVariables = {};
	// On récupère les paramètres dans l'URL et on les place dans dynamicVariables
	// Si on utilise du contenu dynamique : on pourra utiliser ces variables
	const params = getParamsFromURL();
	for (const [key, value] of Object.entries(params)) {
		dynamicVariables["GET" + key] = value;
	}

	const chatbotName = chatData.pop()[0];
	let initialMessage = chatData.pop();
	const chatbotNameHTML = markdownToHTML(chatbotName).replace(/<\/?p>/g, "");
	document.getElementById("chatbot-name").innerHTML = chatbotNameHTML;
	document.title = chatbotNameHTML.replace(/<[^>]*>?/gm, "");

	function precalculateVectorChatbotReponses(chatData) {
		// On précalcule les vecteurs des réponses du chatbot
		let vectorChatBotResponses = [];
		if (yaml.searchInContent || yaml.useLLM.url) {
			for (let i = 0; i < chatData.length; i++) {
				const responses = chatData[i][2];
				let response = Array.isArray(responses)
					? responses.join(" ").toLowerCase()
					: responses.toLowerCase();
				const titleResponse = chatData[i][0];
				response = titleResponse + " " + response;
				const vectorResponse = createVector(response, {
					prioritizeTokensInTitle: true,
					titleResponse: titleResponse,
				});
				vectorChatBotResponses.push(vectorResponse);
			}
		}
		return vectorChatBotResponses;
	}

	const vectorChatBotResponses = precalculateVectorChatbotReponses(chatData);

	let chatbot = {
		dynamicVariables: dynamicVariables,
		data: chatData,
		vectorChatBotResponses: vectorChatBotResponses,
		initialMessage: initialMessage,
		optionsLastResponse: null,
	};

	// Gestion des événéments js
	sendButton.addEventListener("click", () => {
		let userInputText = userInput.innerText;
		if (userInputText.trim() !== "") {
			userInputText = sanitizeHtml(userInputText, allowedTagsInUserInput);
			createChatMessage(chatbot, userInputText, true);
			setTimeout(() => {
				chatbotResponse(chatbot, userInputText);
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
				nextMessage.lastMessageFromBot = "";
				nextMessage.goto = "";
				nextMessage.onlyIfKeywords = false;
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
					chatbotResponse(chatbot, messageFromLink);
				} else {
					createChatMessage(chatbot, messageFromLink, true);
					const optionLink = link.substring(1);
					responseToSelectedOption(chatbot, optionLink);
					// Supprimer le focus sur le bouton qu'on vient de cliquer
					document.activeElement.blur();
					// Refocaliser sur userInput
					if (autoFocus) {
						userInput.focus();
					}
				}
				// Si on clique sur un lien après une directive !Next, on réinitalise le compteur d'erreurs
				nextMessage.errorsCounter = 0;
				scrollWindow({ scrollMode: "instant" });
			}
		}
	}

	chatContainer.addEventListener("click", (event) => handleClick(event));

	const initialMessageContent = initialMessage[0]
		.join("\n")
		.replace('<section class="unique">', '<section class="unique" markdown>');
	const initialMessageOptions = initialMessage[1];

	// Envoi du message d'accueil du chatbot
	initialMessage = gestionOptions(
		chatbot,
		initialMessageContent,
		initialMessageOptions,
	);

	createChatMessage(chatbot, initialMessage, false);
	initialMessage = initialMessage
		.replace(/<span class="unique">.*?<\/span>/g, "")
		.replace(/<section class="unique".*?>[\s\S]*?<\/section>/gm, "");
	// S'il y a un élément dans le message initial qui ne doit apparaître que la première fois qu'il est affiché, alors on supprime cet élément pour les prochaines fois
	chatbot.initialMessage = initialMessage;
}
