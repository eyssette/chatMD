import { scrollWindow } from "../utils/ui.js";
import { yaml } from "../processMarkdown/yaml.js";
import Typed from "../externals/typed.js";
import { processCopyCode } from "../processMarkdown/directivesAndSpecialContents.js";

export const chatContainer = document.getElementById("chat");
export const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

// Le focus automatique sur l'userInput est désactivé sur les téléphones mobiles
const userAgent = window.navigator.userAgent;
const isMobile =
	/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
		userAgent,
	);
export const autoFocus = isMobile ? false : true;

const thresholdMouseMovement = 10;
const regexPre = /(<pre(.|\n)*<\/pre>)/gm;
const regexMessageOptions = /(<ul class="messageOptions">[\s\S]*<\/ul>)/gm;
const regexIframe = /(<iframe(.|\n)*<\/iframe>)/gm;

// Configuration de MutationObserver
let mutationObserver;
const observerConfig = {
	childList: true,
	subtree: true,
};
let observerConnected;

const messageTypeEnterToStopTypeWriter = isMobile
	? "Clic sur “Envoyer” pour stopper l'effet “machine à écrire”"
	: window.innerWidth > 880
		? "Appuyez sur “Enter” pour stopper l'effet “machine à écrire” et afficher la réponse immédiatement"
		: "“Enter” pour stopper l'effet “machine à écrire”";

// Formate le contenu quand on veut utiliser la fonction stopwriter
function formatContentStopTypeWriter(content) {
	content = content.replaceAll("`", "").replace(regexMessageOptions, "`$1`");
	// On doit conserver les retours à la ligne dans les blocs "pre"
	const contentKeepReturnInCode = content.replaceAll(
		regexPre,
		function (match) {
			return match.replaceAll("\n", "RETURNCHARACTER");
		},
	);
	const contentArray = contentKeepReturnInCode.split("\n");
	// On découpe chaque paragraphe pour pouvoir ensuite l'afficher d'un coup
	const contentArrayFiltered = contentArray.map((element) =>
		element.startsWith(pauseTypeWriter)
			? element
					.replace(pauseTypeWriter, "")
					.replaceAll("RETURNCHARACTER", "\n") + "`"
			: element.endsWith("`")
				? "`" + element.replaceAll("RETURNCHARACTER", "\n")
				: "`" +
					element
						.replaceAll("RETURNCHARACTER", "\n")
						.replace(pauseTypeWriterMultipleBots, "") +
					"`",
	);
	return contentArrayFiltered.join(" ");
}

// Active ou désactive la détection des mouvements pour l’auto-scroll
function manageScrollDetection(enable) {
	function scrollHandler(event) {
		if (
			// On désactive l'autoscroll dans 3 cas
			// 1er cas : si on a déplacé la souris (on évite les petits mouvements avec un treshold)
			(event.type === "mousemove" &&
				(Math.abs(event.movementX) > thresholdMouseMovement ||
					Math.abs(event.movementY) > thresholdMouseMovement)) ||
			// 2e cas : si on fait un mouvement vers le haut ou bien vers le bas, mais sans aller jusqu'au bas de la fenêtre
			(event.type === "wheel" &&
				(event.deltaY <= 0 ||
					(event.deltaY > 0 &&
						window.scrollY + window.innerHeight <
							document.body.offsetHeight))) ||
			// 3e cas, sur un portable ou une tablette, si on touche l'écran
			event.type === "touchstart"
		) {
			observerConnected = false;
			mutationObserver.disconnect();
			removeScrollListeners();
			// Sur un portable ou une tablette, on réactive le scroll si finalement on est revenu en bas de la page
			if (event.type === "touchstart") {
				setTimeout(() => {
					if (
						window.scrollY + window.innerHeight + 200 >=
						document.documentElement.scrollHeight
					) {
						observerConnected = true;
						mutationObserver.observe(chatContainer, observerConfig);
					}
				}, 5000);
			}
		} else if (
			// On réactive l'autoscroll si on se déplace vers le bas jusqu'au bas de la fenêtre
			event.type === "wheel" &&
			event.deltaY > 0 &&
			window.scrollY + window.innerHeight >= document.body.offsetHeight
		) {
			observerConnected = true;
			mutationObserver.observe(chatContainer, observerConfig);
		}
	}

	function addScrollListeners() {
		document.addEventListener("mousemove", (event) => {
			scrollHandler(event);
		});
		document.addEventListener("wheel", (event) => {
			scrollHandler(event);
		});
		document.addEventListener("touchstart", (event) => {
			scrollHandler(event);
		});
	}

	function removeScrollListeners() {
		document.removeEventListener("mousemove", scrollHandler);
		document.removeEventListener("wheel", scrollHandler);
		document.removeEventListener("touchstart", scrollHandler);
	}

	if (enable) {
		addScrollListeners();
	} else {
		removeScrollListeners();
	}
}

// Pour stopper l'effet machine à écrire (en appuyant sur “Enter”)
function stopTypeWriter(content, typedElement) {
	typedElement.stop();
	typedElement.reset();
	content = formatContentStopTypeWriter(content);
	typedElement.strings = [content];
	typedElement.start();
	typedElement.destroy();
	scrollWindow(false);
	manageScrollDetection(false);
}

// Pour ajouter des backticks tous les n caractères
function wrapWithBackticksEveryNcharacters(text, n) {
	let wrappedText = "";
	let i = 0;
	while (i < text.length) {
		const substring = text.slice(i, i + n);
		wrappedText += "`" + substring + "`";
		i += n;
	}
	return wrappedText;
}

// Pour découper un texte en chunks de N caractères (afin de l'afficher plus rapidement), sans découper les balises HTML et sans découper le texte qui est déjà entre des backticks
function chunkByNChars(html, n) {
	// Divise le texte sur les backticks
	const parts = html.split(/(`[^`]*`)/);
	// Traite chaque partie
	const processedParts = parts.map((part) => {
		// Si la partie est entre backticks, on la garde telle quelle
		if (part.startsWith("`") && part.endsWith("`")) {
			return part;
		} else {
			// Traite le texte à l'intérieur des balises HTML
			return part.replace(/>([^<]*)</g, (match, textBetweenTags) => {
				// Traiter le texte entre balises HTML : on ajoute des backticks tous les N caractères
				const processedText = wrapWithBackticksEveryNcharacters(
					textBetweenTags,
					n,
				);
				return ">" + processedText + "<";
			});
		}
	});
	return processedParts.join("");
}

let typed;
const pauseTypeWriter = "^300 ";
export const pauseTypeWriterMultipleBots = "^200 "; // Valeur qui doit être différente de pauseTypeWriter pour ne pas créer de conflit dans la fonction stopTypeWriter

// Effet machine à écrire
function typeWriter(content, element, accelerateFactor) {
	return new Promise((resolve) => {
		function keypressHandler(event) {
			if (event.key === "Enter") {
				mutationObserver.disconnect();
				observerConnected = false;
				stopTypeWriter(content, typed);
			}
		}

		// S'il y a des options en fin de message, on les fait apparaître d'un coup, sans effet typeWriter
		content = content.replace(regexMessageOptions, pauseTypeWriter + "`$1`");

		// On fait apparaître d'un coup les iframes
		content = content.replaceAll(regexIframe, "`$1`");

		// On peut accéler l'effet machine à écrire en regroupant les caractères : au lieu de les afficher un par, on les affiche N par N (N = le facteur d'accélération)
		if (accelerateFactor) {
			content = chunkByNChars(content, accelerateFactor);
		} else {
			// Accélération par défaut pour Firefox sur Windows
			const isFirefoxOnWindows =
				userAgent.includes("Firefox") && userAgent.includes("Windows");
			if (isFirefoxOnWindows) {
				content = chunkByNChars(content, 5);
			}
		}

		const start = Date.now();
		observerConnected = true;
		let watchExecutionTime = true;
		function handleMutation() {
			// On arrête l'effet “machine à écrire” si le temps d'exécution est trop important
			if (watchExecutionTime) {
				const executionTime = Date.now() - start;
				const checkpointTime = 1000;
				const minCharLength = 80;
				if (executionTime > checkpointTime && observerConnected) {
					if (element.innerHTML.length < minCharLength) {
						stopTypeWriter(content, typed);
						observerConnected = false;
						mutationObserver.disconnect();
					}
					watchExecutionTime = false;
				}
			}

			// On scrolle automatiquement la fenêtre pour suivre l'affichage du texte
			if (observerConnected) {
				scrollWindow(true);
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
				if (yaml.userInput == false) {
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
				mutationObserver = new MutationObserver(handleMutation);
				observerConnected = true;
				mutationObserver.observe(chatContainer, observerConfig);
				setTimeout(() => manageScrollDetection(true), 1000);
			},
			onComplete: () => {
				// Si on a désactivé le clavier, on remet l'opacité du bouton à 0.5 pour pouvoir voir en grisé le bouton "Afficher tout"
				if (
					yaml.userInput == false &&
					document.body.classList.contains("hideControls")
				) {
					sendButton.style.opacity = "0.5";
				}
				// Gestion de textFit pour les éléments en Latex
				if (yaml.addOns && yaml.addOns.includes("textFit")) {
					window.textFit(element.querySelectorAll(".katex-display"));
				}
				// Quand l'effet s'arrête on supprime la détection du bouton Enter pour stopper l'effet
				userInput.removeEventListener("keypress", keypressHandler);
				if (
					userInput.getAttribute("placeholder") ==
					messageTypeEnterToStopTypeWriter
				) {
					userInput.setAttribute("placeholder", "Écrivez votre message");
				}
				observerConnected = false;
				mutationObserver.disconnect();
				manageScrollDetection(false);
				resolve();
			},
		});
	});
}

export function displayMessage(html, isUser, chatMessage, container) {
	return new Promise((resolve) => {
		// On affiche le message dans un container. Par défaut on affiche le message comme un nouveau message dans le chat, mais on peut définir un container (pour afficher le message comme un élément enfant d'un nouveau message en cas de génération de message à la fois via le markdown et un LLM : dans ce cas, il faut que le contenu des messages se suivent, dans un même message, au lieu d'ajouter un nouveau message à chaque fois)
		if (container) {
			chatContainer.appendChild(container);
		} else {
			container = chatContainer;
		}
		container.appendChild(chatMessage);
		html = isUser ? html : processCopyCode(html);
		// Effet machine à écrire : seulement quand c'est le chatbot qui répond, sinon affichage direct
		// Pas d'effet machine à écrire s'il y a la préférence : "prefers-reduced-motion"
		if (
			isUser ||
			window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
			yaml.typeWriter === false
		) {
			chatMessage.innerHTML = html;
			resolve();
		} else {
			typeWriter(html, chatMessage).then(() => resolve());
		}
	});
}
