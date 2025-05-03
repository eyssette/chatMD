import { yaml } from "../../yaml.mjs";
import { getAnswerFromLLM } from "../../../../ai/api.mjs";
import { convertLatexExpressions } from "../../../latex.mjs";
import { displayMessage } from "../../../../core/messages/display.mjs";
import { markdownToHTML } from "../../../parser.mjs";
import { processMultipleBots } from "../bot.mjs";

// On attend que la librairie de gestion de Latex soit disponible (avec un maximum d'essais pour éviter une boucle infinie)
function waitForKaTeX() {
	return new Promise((resolve) => {
		let attempts = 0;
		const interval = setInterval(() => {
			if (window.katex || attempts > 10) {
				clearInterval(interval);
				resolve();
			} else {
				attempts++;
			}
		}, 100);
	});
}

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
				let htmlContent = markdownToHTML(content);
				if (yaml && yaml.bots) {
					htmlContent = processMultipleBots(htmlContent);
				}
				if (yaml && yaml.maths) {
					await waitForKaTeX();
					htmlContent = convertLatexExpressions(htmlContent);
				}
				await displayMessage(
					htmlContent,
					isUser,
					chatMessageElement,
					chatMessage,
				);
			}
		} catch (error) {
			console.error(
				"Une erreur s'est produite lors du traitement des messages :",
				error,
			);
		}
	}
}
