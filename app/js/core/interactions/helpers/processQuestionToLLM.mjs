import { yaml } from "../../../markdown/custom/yaml.mjs";
import { RAGcontent, vectorRAGinformations } from "../../../ai/rag/engine.mjs";
import { cosineSimilarity } from "../../../utils/nlp.mjs";
import { topElements } from "../../../utils/arrays.mjs";
import { getAnswerFromLLM } from "../../../ai/getAnswerFromLLM.mjs";

export function processQuestionToLLM(chatbot, inputText, options) {
	if (!yaml || !yaml.useLLM || !yaml.useLLM.url || !yaml.useLLM.model)
		return null;
	const shouldUseLLM =
		options && options.useLLM == true ? true : inputText.includes("!useLLM");
	if (!shouldUseLLM) return null;
	const questionToLLM = inputText
		.replace("!useLLM", "")
		.replace('<span class="hidden">/span>', "");
	let RAGbestMatchesInformation = "";
	if (yaml && yaml.useLLM.RAGinformations) {
		// On ne retient dans les informations RAG que les informations pertinentes par rapport à la demande de l'utilisateur
		const cosSimArray = vectorRAGinformations.map((vectorRAGinformation) =>
			cosineSimilarity(questionToLLM, vectorRAGinformation, {
				boostIfKeywordsInTitle: chatbot.nextMessage && chatbot.nextMessage.goto,
			}),
		);
		const RAGbestMatchesIndexes = topElements(
			cosSimArray,
			yaml.useLLM.RAGmaxTopElements,
		);
		RAGbestMatchesInformation = RAGbestMatchesIndexes.map(
			(element) => RAGcontent[element[1]],
		).join("\n");
	}
	const RAGinformations =
		options && options.RAG
			? options.RAG + "\n" + RAGbestMatchesInformation
			: RAGbestMatchesInformation;
	getAnswerFromLLM(chatbot, questionToLLM, { RAG: RAGinformations });
	return true;
}
