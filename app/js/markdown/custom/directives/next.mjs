import { yaml } from "../yaml.mjs";
import { obfuscateString } from "../../../utils/strings.mjs";

// Gestion de la directive !Next: Titre réponse / message si mauvaise réponse
export function processDirectiveNext(chatbot, message) {
	message = message.replaceAll(
		/!Next ?:(.*)/g,
		function (match, nextDirectiveContent) {
			const nextDirectiveContentSplit = nextDirectiveContent.split("/");
			let nextDirectiveOptions;
			if (nextDirectiveContentSplit.length > 0) {
				nextDirectiveContent = nextDirectiveContentSplit[0];
				nextDirectiveOptions = nextDirectiveContentSplit[1];
			} else {
				nextDirectiveContent = nextDirectiveContentSplit[0];
			}
			const isLoopMode = nextDirectiveContent.includes("!loop");

			chatbot.nextMessage.lastMessageFromBot = message;
			chatbot.nextMessage.goto = nextDirectiveContent
				.replace("!loop", "")
				.trim();
			chatbot.nextMessage.ignoreKeywords =
				nextDirectiveOptions && nextDirectiveOptions.includes("ignoreKeywords")
					? true
					: false;
			chatbot.nextMessage.needsProcessing = true;
			chatbot.nextMessage.messageIfKeywordsNotFound = nextDirectiveOptions
				? nextDirectiveOptions.trim()
				: "Ce n'était pas la bonne réponse, merci de réessayer !";
			chatbot.nextMessage.messageIfKeywordsNotFound =
				chatbot.nextMessage.messageIfKeywordsNotFound + "\n\n";
			chatbot.nextMessage.errorsCounter++;
			if (
				match &&
				(chatbot.nextMessage.errorsCounter < chatbot.nextMessage.maxErrors ||
					isLoopMode)
			) {
				return "";
			} else {
				const skipMessage = `<ul class="messageOptions"><li><a href="#${
					yaml.obfuscate
						? obfuscateString(chatbot.nextMessage.goto)
						: chatbot.nextMessage.goto
				}">Passer à la suite !</a></li></ul>`;
				return skipMessage;
			}
		},
	);
	return message;
}
