import { getAnswerFromLLM } from "../../../../ai/getAnswerFromLLM.mjs";
import { displayMessage } from "../../../../core/messages/displayMessage.mjs";
import { processPromptWithRAG } from "./processPromptWithRAG.mjs";
import { appendMessageToContainer } from "../../../../core/messages/helpers/dom.mjs";
import { endsWithUnclosedHtmlTag } from "../../../../utils/strings.mjs";

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

		// Gestion des variables dynamiques de type SELECTOR["cssSelector"] qui n'ont pas encore été remplacées par leur valeur (notamment : si le sélecteur ciblait un bloc spécial : readcsv, !useLLM)
		// On remplace toutes les occurrences de ce type de variable par le contenu textuel de l'élément correspondant dans le document
		content = content.replace(
			/`@SELECTOR\["([^"]+)"\]`/g,
			function (match, cssSelector) {
				const element = document.querySelector(cssSelector);
				const value = element ? element.textContent.trim() : "";
				return value;
			},
		);

		try {
			if (type === "prompt") {
				// Gestion du contenu qui fait appel à un LLM
				if (i === 0) {
					appendMessageToContainer(sectionElement, messageElement);
				}
				let RAGinformations = "";
				let RAGprompt = "";
				// Gestion de l'historique des échanges avec le LLM
				let shouldUseConversationHistory = false;
				if (content.includes("!useHistory")) {
					shouldUseConversationHistory = true;
					content = content.replace("!useHistory", "");
				}
				// Gestion du RAG
				if (content.includes("!RAG: ")) {
					const promptWithRag = await processPromptWithRAG(chatbot, content);
					content = promptWithRag.content;
					RAGinformations = promptWithRag.RAGinformations;
					RAGprompt = promptWithRag.RAGprompt;
				}

				// On vérifie si l'élément précédent dans la séquence se finit par un élément html ouvert qui n'a pas été encore fermé
				const previousSection = sequence[i - 1];
				const previousContent = previousSection ? previousSection.content : "";
				const hasUnclosedHtmlTagAtEnd =
					endsWithUnclosedHtmlTag(previousContent);
				// Si l'élément précédent se termine par une balise HTML ouverte non fermée, on ajoute le contenu dans cette balise
				const container = hasUnclosedHtmlTagAtEnd
					? messageElement.lastChild.lastChild
					: messageElement;

				await getAnswerFromLLM(chatbot, content, {
					RAG: RAGinformations,
					RAGprompt: RAGprompt,
					messageElement: sectionElement,
					container: container,
					inline: true,
					useConversationHistory: shouldUseConversationHistory,
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
