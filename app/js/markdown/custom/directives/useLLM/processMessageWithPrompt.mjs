import { yaml } from "../../yaml.mjs";
import { getAnswerFromLLM } from "../../../../ai/api.mjs";
import { convertLatexExpressions } from "../../../latex.mjs";
import { displayMessage } from "../../../../core/messages/display.mjs";
import { markdownToHTML } from "../../../parser.mjs";
import { processMultipleBots } from "../bot.mjs";

// Affiche un message ou récupère une réponse du LLM
async function handleContent({
	useLLM,
	content,
	isUser,
	chatMessageElement,
	chatMessage,
}) {
	if (useLLM && content.trim()) {
		await getAnswerFromLLM(content, "", chatMessageElement, chatMessage);
		return;
	}

	if (yaml && yaml.maths) {
		await waitForKaTeX();
		content = convertLatexExpressions(content);
	}

	await displayMessage(content, isUser, chatMessageElement, chatMessage);
}

// Attend que KaTeX soit prêt (ou timeout après 10 tentatives)
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
	for (let i = 0; i < sequence.length; i++) {
		const part = sequence[i];
		const isLLMPart = i % 2 === 1;
		const chatMessageElement = document.createElement("div");
		let content;

		try {
			if (isLLMPart) {
				// Gestion du contenu qui fait appel à un LLM
				content = part;
			} else {
				// Gestion du contenu en Markdown
				content = markdownToHTML(part);
				if (yaml && yaml.bots) {
					content = processMultipleBots(content);
				}
			}

			await handleContent({
				useLLM: isLLMPart,
				content,
				isUser,
				chatMessageElement,
				chatMessage,
			});
		} catch (error) {
			console.error(
				"Une erreur s'est produite lors du traitement des messages :",
				error,
			);
		}
	}
}
