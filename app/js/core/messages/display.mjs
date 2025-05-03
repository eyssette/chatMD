import { processCopyCode } from "./helpers/plugins/copyCode.mjs";
import { startTypeWriter } from "./typewriter/start.mjs";
import { shouldDisableTypewriter } from "./typewriter/disabled.mjs";
import { cleanTypewriterSyntax } from "./typewriter/sanitize.mjs";
import { appendMessageToContainer } from "./helpers/dom.mjs";

export function displayMessage(html, isUser, chatMessage, container) {
	return new Promise((resolve) => {
		if (!html) return resolve();

		// On ajoute dans le DOM le message HTML dans le container spécifié
		appendMessageToContainer(chatMessage, container);

		html = isUser ? html : processCopyCode(html);

		// Effet machine à écrire : seulement quand c'est le chatbot qui répond, sinon affichage direct
		// Pas d'effet machine à écrire s'il a été désactivé par l'utilisateur ou le créateur du chatbot
		if (isUser || shouldDisableTypewriter()) {
			// Si on n'utilise pas l'effet typewriter, on supprime la syntaxe spécifique à cet effet dans le message
			chatMessage.innerHTML = cleanTypewriterSyntax(html);
			resolve();
		} else {
			startTypeWriter(html, chatMessage).then(() => resolve());
		}
	});
}
