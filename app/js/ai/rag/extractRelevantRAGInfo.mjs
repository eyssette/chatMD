import { cosineSimilarityTextVector } from "../../utils/nlp.mjs";
import { topElements } from "../../utils/arrays.mjs";
import { yaml } from "../../markdown/custom/yaml.mjs";

export function extractRelevantRAGinfo(chatbot, question, options) {
	const RAGcontent =
		options && options.RAG && options.RAG.content
			? options.RAG.content
			: chatbot.RAG.content;
	const vectorRAGinformations =
		options && options.RAG && options.RAG.vector
			? options.RAG.vector
			: chatbot.RAG.vector;
	const maxResults =
		options && options.maxResults
			? options.maxResults
			: yaml.useLLM.RAGmaxTopElements;

	const cosSimArray = vectorRAGinformations.map((vectorRAGinformation) =>
		cosineSimilarityTextVector(question, vectorRAGinformation, {
			boostIfKeywordsInTitle: chatbot.nextMessage && chatbot.nextMessage.goto,
		}),
	);

	const RAGbestMatchesIndexes = topElements(cosSimArray, maxResults);

	return RAGbestMatchesIndexes.map((element) => RAGcontent[element[1]]).join(
		"\n",
	);
}
