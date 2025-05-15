import { yaml } from "../../../markdown/custom/yaml.mjs";
import { getAnswerFromLLM } from "../../../ai/getAnswerFromLLM.mjs";
import { extractRelevantRAGinfo } from "../../../ai/rag/extractRelevantRAGInfo.mjs";

export function processQuestionToLLM(chatbot, inputText, options) {
	if (!yaml || !yaml.useLLM || !yaml.useLLM.url || !yaml.useLLM.model)
		return null;
	const shouldUseLLM =
		options && options.useLLM == true ? true : inputText.includes("!useLLM");
	if (!shouldUseLLM) return null;
	const questionToLLM = inputText
		.replace("!useLLM", "")
		.replace('<span class="hidden">/span>', "");
	const RAGbestMatchesInformation =
		yaml && yaml.useLLM.RAGinformations
			? extractRelevantRAGinfo(chatbot, questionToLLM)
			: "";
	const RAGinformations =
		options && options.RAG
			? options.RAG + "\n" + RAGbestMatchesInformation
			: RAGbestMatchesInformation;
	getAnswerFromLLM(chatbot, questionToLLM, { RAG: RAGinformations });
	return true;
}
