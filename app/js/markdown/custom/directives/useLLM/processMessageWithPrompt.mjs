import { getAnswerFromLLM } from "../../../../ai/getAnswerFromLLM.mjs";
import { displayMessage } from "../../../../core/messages/display.mjs";

// Traite chaque partie d’un message découpé (Markdown / LLM)
export async function processMessageWithPrompt(sequence, chatMessage, isUser) {
	for (const section of sequence) {
		const type = section.type;
		let content = section.content;
		const chatMessageElement = document.createElement("div");

		try {
			if (type === "prompt") {
				// Gestion du contenu qui fait appel à un LLM
				await getAnswerFromLLM(content, "", chatMessageElement, chatMessage);
			} else if (type === "markdown") {
				// Gestion du contenu en Markdown
				await displayMessage(content, isUser, chatMessageElement, chatMessage);
			}
		} catch (error) {
			console.error(
				"Une erreur s'est produite lors du traitement des messages :",
				error,
			);
		}
	}
}
