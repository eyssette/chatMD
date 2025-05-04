import { getContent } from "./getContent.mjs";
import { parseMarkdown } from "./parseMarkdown.mjs";
import { initializeChatbot } from "./initialize.mjs";

// Pour créer le chatbot à partir d'une source en Markdown
export async function createChatbot(defaultMd) {
	try {
		// On récupère le contenu en Markdown qui constitue la source du chatbot
		const content = await getContent(defaultMd);

		// On traite le contenu en Markdown pour créer la structure du chatbot
		const chatbotData = parseMarkdown(content.markdown, content.yaml);

		// On initialise le chatbot à partir de cette structure
		initializeChatbot(chatbotData, content.yaml);
	} catch (error) {
		console.error(error);
	}
}
