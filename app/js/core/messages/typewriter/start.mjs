import Typed from "../../../lib/typed.js";
import { manageScrollDetection } from "../helpers/scroll.mjs";
import { stopTypeWriter } from "./stop.mjs";
import { splitHtmlIntoChunks } from "../../../utils/strings.mjs";
import {
	chatContainer,
	sendButton,
	userInput,
} from "../../../shared/selectors.mjs";
import {
	pauseTypeWriter,
	autoFocus,
	isMobile,
	isFirefoxOnWindows,
	regex,
} from "../../../shared/constants.mjs";
import { scrollWindow } from "../../../utils/ui.mjs";
import { yaml } from "../../../markdown/custom/yaml.mjs";

// Configuration de l'observer
let observer = {
	config: {
		childList: true,
		subtree: true,
	},
};

const messageTypeEnterToStopTypeWriter = isMobile
	? "Clic sur “Envoyer” pour stopper l'effet “machine à écrire”"
	: window.innerWidth > 880
		? "Appuyez sur “Enter” pour stopper l'effet “machine à écrire” et afficher la réponse immédiatement"
		: "“Enter” pour stopper l'effet “machine à écrire”";

let typed;

// Effet machine à écrire
export function startTypeWriter(content, element, accelerateFactor) {
	return new Promise((resolve) => {
		function keypressHandler(event) {
			if (event.key === "Enter") {
				observer.mutationObserver.disconnect();
				observer.connected = false;
				stopTypeWriter(content, typed);
			}
		}

		// S'il y a des options en fin de message, on les fait apparaître d'un coup, sans effet typeWriter
		content = content.replace(regex.messageOptions, pauseTypeWriter + "`$1`");

		// On fait apparaître d'un coup les iframes
		content = content.replaceAll(regex.iframe, "`$1`");

		// On peut accéler l'effet machine à écrire en regroupant les caractères : au lieu de les afficher un par, on les affiche N par N (N = le facteur d'accélération)
		if (accelerateFactor) {
			content = splitHtmlIntoChunks(content, accelerateFactor);
		} else {
			// Accélération par défaut pour Firefox sur Windows
			if (isFirefoxOnWindows) {
				content = splitHtmlIntoChunks(content, 5);
			}
		}

		const start = Date.now();
		observer.connected = true;
		let watchExecutionTime = true;
		function handleMutation() {
			// On arrête l'effet “machine à écrire” si le temps d'exécution est trop important
			if (watchExecutionTime) {
				const executionTime = Date.now() - start;
				const checkpointTime = 1000;
				const minCharLength = 80;
				if (executionTime > checkpointTime && observer.connected) {
					if (element.innerHTML.length < minCharLength) {
						stopTypeWriter(content, typed);
						observer.connected = false;
						observer.mutationObserver.disconnect();
					}
					watchExecutionTime = false;
				}
			}

			// On scrolle automatiquement la fenêtre pour suivre l'affichage du texte
			if (observer.connected) {
				scrollWindow({ scrollMode: "smooth" });
			}
		}

		// Effet machine à écrire
		typed = new Typed(element, {
			strings: [content],
			typeSpeed: 0,
			startDelay: 100,
			showCursor: false,
			onBegin: () => {
				// Si on a désactivé le clavier, on remet l'opacité du bouton à 1 pour pouvoir voir le bouton "Afficher tout"
				if (yaml && yaml.userInput == false) {
					sendButton.style.opacity = "1";
				}
				// Quand l'effet démarre, on refocalise sur userInput (sauf sur les smartphones)
				if (autoFocus) {
					userInput.focus();
				}
				// On détecte un appui sur Enter pour stopper l'effet machine à écrire
				userInput.addEventListener("keypress", keypressHandler);
				userInput.setAttribute("placeholder", messageTypeEnterToStopTypeWriter);

				// On détecte le remplissage petit à petit du DOM pour scroller automatiquement la fenêtre vers le bas
				observer.mutationObserver = new MutationObserver(handleMutation);
				observer.connected = true;
				observer.mutationObserver.observe(chatContainer, observer.config);
				setTimeout(() => manageScrollDetection(true, observer), 1000);
			},
			onComplete: () => {
				// Si on a désactivé le clavier, on remet l'opacité du bouton à 0.5 pour pouvoir voir en grisé le bouton "Afficher tout"
				if (
					yaml.userInput == false &&
					document.body.classList.contains("hideControls")
				) {
					sendButton.style.opacity = "0.5";
				}
				// Quand l'effet s'arrête on supprime la détection du bouton Enter pour stopper l'effet
				userInput.removeEventListener("keypress", keypressHandler);
				if (
					userInput.getAttribute("placeholder") ==
					messageTypeEnterToStopTypeWriter
				) {
					userInput.setAttribute("placeholder", "Écrivez votre message");
				}
				observer.connected = false;
				observer.mutationObserver.disconnect();
				manageScrollDetection(false, observer);
				resolve();
			},
		});
	});
}
