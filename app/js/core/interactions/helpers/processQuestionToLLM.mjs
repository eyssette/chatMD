import { yaml } from "../../../markdown/custom/yaml.mjs";
import { getAnswerFromLLM } from "../../../ai/getAnswerFromLLM.mjs";
import { extractRelevantRAGinfo } from "../../../ai/rag/extractRelevantRAGInfo.mjs";

export function processQuestionToLLM(chatbot, inputText, options) {
	if (!yaml || !yaml.useLLM || !yaml.useLLM.url || !yaml.useLLM.model)
		return null;
	const shouldUseLLM =
		options && options.useLLM == true ? true : inputText.includes("!useLLM");
	if (!shouldUseLLM) return null;
	let questionToLLM = inputText
		.replace("!useLLM", "")
		.replace('<span class="hidden">/span>', "");
	// Gestion de l'historique des échanges avec le LLM
	let shouldUseConversationHistory = false;
	if (questionToLLM.includes("!useHistory")) {
		shouldUseConversationHistory = true;
		questionToLLM = questionToLLM.replace("!useHistory", "");
	}
	const RAGbestMatchesInformation =
		yaml && yaml.useLLM.RAGinformations
			? extractRelevantRAGinfo(chatbot, questionToLLM)
			: "";
	const RAGinformations =
		options && options.RAG
			? options.RAG + "\n" + RAGbestMatchesInformation
			: RAGbestMatchesInformation;
	getAnswerFromLLM(chatbot, questionToLLM, {
		RAG: RAGinformations,
		useConversationHistory: shouldUseConversationHistory,
	});
	return true;
}
