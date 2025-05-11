import { getAnswerFromLLM } from "../../../../ai/getAnswerFromLLM.mjs";
import { displayMessage } from "../../../../core/messages/displayMessage.mjs";

// Traite chaque partie d’un message découpé (Markdown / LLM)
export async function processMessageWithPrompt(
	chatbot,
	sequence,
	messageElement,
	isUser,
) {
	for (const section of sequence) {
		const type = section.type;
		let content = section.content;
		const sectionElement = document.createElement("div");

		try {
			if (type === "prompt") {
				// Gestion du contenu qui fait appel à un LLM
				await getAnswerFromLLM(chatbot, content, {
					RAG: "",
					messageElement: sectionElement,
					container: messageElement,
					inline: true,
				});
			} else if (type === "markdown") {
				// Gestion du contenu en Markdown
				await displayMessage(content, {
					isUser: isUser,
					htmlElement: sectionElement,
					appendTo: messageElement,
					noMessageMenu: true,
				});
			}
		} catch (error) {
			console.error(
				"Une erreur s'est produite lors du traitement des messages :",
				error,
			);
		}
	}
}
