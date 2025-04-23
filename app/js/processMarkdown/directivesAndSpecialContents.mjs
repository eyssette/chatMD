import { getRandomElement, shuffleArray } from "../utils/arrays";
import { pauseTypeWriterMultipleBots } from "../chatbot/typewriter";
import { yaml } from "./yaml";

export let nextMessage = {
	goto: "",
	lastMessageFromBot: "",
	selected: "",
	onlyIfKeywords: false,
	errorsCounter: 0,
	maxErrors: 3,
	messageIfKeywordsNotFound: "",
};

// Gestion de la directive !Next: Titre réponse / message si mauvaise réponse
export function processDirectiveNext(message) {
	message = message.replaceAll(
		/!Next ?:(.*)/g,
		function (match, nextDirectiveContent) {
			const nextDirectiveContentSplit = nextDirectiveContent.split("/");
			let messageIfError;
			if (nextDirectiveContentSplit.length > 0) {
				nextDirectiveContent = nextDirectiveContentSplit[0];
				messageIfError = nextDirectiveContentSplit[1];
			} else {
				nextDirectiveContent = nextDirectiveContentSplit[0];
			}
			const isLoopMode = nextDirectiveContent.includes("!loop");

			nextMessage.lastMessageFromBot = message;
			nextMessage.goto = nextDirectiveContent.replace("!loop", "").trim();
			nextMessage.onlyIfKeywords = true;
			nextMessage.messageIfKeywordsNotFound = messageIfError
				? messageIfError.trim()
				: "Ce n'était pas la bonne réponse, merci de réessayer !";
			nextMessage.messageIfKeywordsNotFound =
				nextMessage.messageIfKeywordsNotFound + "\n\n";
			nextMessage.errorsCounter++;
			if (
				match &&
				(nextMessage.errorsCounter < nextMessage.maxErrors || isLoopMode)
			) {
				return "";
			} else {
				const skipMessage = `<ul class="messageOptions"><li><a href="#${
					yaml.obfuscate ? btoa(nextMessage.goto) : nextMessage.goto
				}">Passer à la suite !</a></li></ul>`;
				return skipMessage;
			}
		},
	);
	return message;
}

// Gestion de la directive !SelectNext pour sélectionner aléatoirement le prochain message du chatbot
export function processDirectiveSelectNext(message) {
	message = message.replaceAll(/!SelectNext:(.*)/g, function (match, v1) {
		if (match) {
			const v1Split = v1.split("/");
			nextMessage.lastMessageFromBot = "";
			nextMessage.goto = "";
			nextMessage.onlyIfKeywords = false;
			nextMessage.selected = getRandomElement(v1Split).trim();
			return "";
		} else {
			nextMessage.selected = "";
		}
	});
	return message;
}

// Gestion de la directive "!Select: x" : on sélectionne aléatoirement seulement x options dans l'ensemble des options disponibles
export function processDirectiveSelect(response, options) {
	response = response.replaceAll(/!Select ?: ?([0-9]*)/g, function (match, v1) {
		if (match && v1 <= options.length) {
			options = shuffleArray(options).slice(0, v1);
			return "<!--" + match + "-->";
		} else {
			return "";
		}
	});
	return [response, options];
}

// Gestion de la directive !Bot: botName pour pouvoir avoir différents bots possibles
export function processDirectiveBot(message, chatMessage) {
	message = message.replace(/!Bot:(.*)/, function (match, botName) {
		if (match && botName) {
			botName = botName.trim().replaceAll(" ", "");
			chatMessage.classList.add("botName-" + botName);
		}
		return "";
	});
	return message;
}

// Possibilité d'avoir plusieurs bots qui répondent dans un même message
export function processMultipleBots(html) {
	const htmlSplitDirectiveBot = html.split("<p>!Bot:");
	const numberOfBots = htmlSplitDirectiveBot.length;
	if (numberOfBots > 1) {
		let newHtml = htmlSplitDirectiveBot[0];
		for (let index = 1; index < numberOfBots; index++) {
			const botMessageContent = htmlSplitDirectiveBot[index].trim();
			const botNameMatch = botMessageContent.match(/(.*?)<\/p>((.|\n)*)/);
			const botName = botNameMatch[1].trim();
			const botMessage = botNameMatch[2].trim();
			newHtml =
				newHtml +
				pauseTypeWriterMultipleBots +
				'<div class="message bot-message botName-' +
				botName +
				'">' +
				botMessage +
				"</div>";
		}
		html = newHtml;
	}
	return html;
}

// Gestion du cas où il y a plusieurs messages possibles de réponse, séparés par "---"
export function processRandomMessage(message) {
	const messageSplitHR = message.split("\n---\n");
	if (messageSplitHR.length > 1) {
		const messageHasOptions = message.indexOf('<ul class="messageOptions">');
		if (messageHasOptions > -1) {
			const messageWithoutOptions = message.substring(0, messageHasOptions);
			const messageOptions = message.substring(messageHasOptions);
			const messageWithoutOptionsSplitHR = messageWithoutOptions.split("---");
			message = getRandomElement(messageWithoutOptionsSplitHR) + messageOptions;
		} else {
			message = getRandomElement(messageSplitHR);
		}
	}
	return message;
}

// Gestion de l'audio
export function processAudio(message) {
	// Gestion des éléments audio autoplay
	message = message.replaceAll(
		/<audio[\s\S]*?src="([^"]+)"[\s\S]*?<\/audio>/gm,
		function (match, v1) {
			if (match.includes("autoplay")) {
				const audio = new Audio(v1);
				audio.play();
				if (match.includes("loop")) {
					audio.addEventListener("ended", () => {
						audio.currentTime = 0;
						audio.play();
					});
				}
				return `<!--${match}-->`;
			} else {
				return match;
			}
		},
	);
	// Gestion de l'audio avec la directive !Audio
	message = message.replaceAll(/!Audio:(.*)/g, function (match, v1) {
		const audio = new Audio(v1.trim());
		audio.play();
		return "";
	});

	return message;
}

// Gestion de schémas et images créés avec mermaid, tikz, graphviz, plantuml …  grâce à Kroki (il faut l'inclure en addOn si on veut l'utiliser)

export function processKroki(message) {
	message = message.replaceAll(
		/```(mermaid|tikz|graphviz|plantuml|excalidraw|vegalite|vega)((.|\n)*?)```/gm,
		function (match, type, source) {
			source = source.replaceAll("\n\n\n", "\n\n");
			return window.krokiCreateImageFromSource(type, source);
		},
	);
	return message;
}

// Ajoute un bouton "copier" pour les blocs code

export function processCopyCode(html) {
	html = html.replaceAll(
		"</pre>",
		'<button class="copyCode">Copier</button></pre>',
	);
	return html;
}
