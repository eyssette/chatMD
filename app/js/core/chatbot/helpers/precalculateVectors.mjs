import { createVector } from "../../../utils/nlp.mjs";

export function precalculateVectorChatbotResponses(chatbotResponses, yaml) {
	// On précalcule les vecteurs des réponses du chatbot
	let vectorChatBotResponses = [];
	if ((yaml && yaml.searchInContent) || (yaml && yaml.useLLM.url)) {
		for (let i = 0; i < chatbotResponses.length; i++) {
			const responseContent = chatbotResponses[i].content;
			let response = Array.isArray(responseContent)
				? responseContent.join(" ").toLowerCase()
				: responseContent.toLowerCase();
			const titleResponse = chatbotResponses[i].title;
			response = titleResponse + " " + response;
			const vectorResponse = createVector(response, {
				prioritizeTokensInTitle: true,
				titleResponse: titleResponse,
			});
			vectorChatBotResponses.push(vectorResponse);
		}
	}
	return vectorChatBotResponses;
}
