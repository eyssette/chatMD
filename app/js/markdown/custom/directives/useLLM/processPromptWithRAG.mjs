import { getRAGcontent } from "../../../../ai/rag/engine.mjs";
import { extractRelevantRAGinfo } from "../../../../ai/rag/extractRelevantRAGInfo.mjs";
import { parseRAGdirective, parseOptions } from "./helpers/RAGparser.mjs";

// Traitement des prompts avec du RAG
// Le prompt doit contenir une ligne avec : !RAG: {contenu} {url:zerzerezr url:zerzer}
export async function processPromptWithRAG(chatbot, content) {
	const RAGdirective = parseRAGdirective(content);
	if (!RAGdirective) {
		return { content, RAGinformations: "" };
	}

	const { question, optionsList } = RAGdirective;
	const options = parseOptions(optionsList);

	const RAGinformations = options.url ? await getRAGcontent(options.url) : "";

	const topRAGinformations = extractRelevantRAGinfo(chatbot, question, {
		RAG: RAGinformations,
		maxResults: options && options.maxResults ? options.maxResults : undefined,
	});

	return {
		content: content.replace(RAGdirective.RAGline, ""),
		RAGinformations: topRAGinformations,
	};
}
