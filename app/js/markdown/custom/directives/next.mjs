import { yaml } from "../yaml.mjs";

// Gestion de la directive !Next: Titre réponse / message si mauvaise réponse
export function processDirectiveNext(chatbot, message) {
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

			chatbot.nextMessage.lastMessageFromBot = message;
			chatbot.nextMessage.goto = nextDirectiveContent
				.replace("!loop", "")
				.trim();
			chatbot.nextMessage.needsProcessing = true;
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
						? btoa(chatbot.nextMessage.goto)
						: chatbot.nextMessage.goto
				}">Passer à la suite !</a></li></ul>`;
				return skipMessage;
			}
		},
	);
	return message;
}
