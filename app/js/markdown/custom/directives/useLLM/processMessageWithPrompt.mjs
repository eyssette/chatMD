import { getAnswerFromLLM } from "../../../../ai/getAnswerFromLLM.mjs";
import { displayMessage } from "../../../../core/messages/displayMessage.mjs";
import { processPromptWithRAG } from "./processPromptWithRAG.mjs";
import { appendMessageToContainer } from "../../../../core/messages/helpers/dom.mjs";

// Traite chaque partie d’un message découpé (Markdown / LLM)
export async function processMessageWithPrompt(
	chatbot,
	sequence,
	messageElement,
	isUser,
) {
	for (let i = 0; i < sequence.length; i++) {
		const section = sequence[i];
		const type = section.type;
		let content = section.content;
		const sectionElement = document.createElement("div");

		try {
			if (type === "prompt") {
				if (i === 0) {
					appendMessageToContainer(sectionElement, messageElement);
				}
				let RAGinformations = "";
				if (content.includes("!RAG: ")) {
					const promptWithRag = await processPromptWithRAG(chatbot, content);
					content = promptWithRag.content;
					RAGinformations = promptWithRag.RAGinformations;
				}
				// Gestion du contenu qui fait appel à un LLM
				await getAnswerFromLLM(chatbot, content, {
					RAG: RAGinformations,
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
