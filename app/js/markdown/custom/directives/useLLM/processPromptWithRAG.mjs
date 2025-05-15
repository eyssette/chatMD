import { getRAGcontent } from "../../../../ai/rag/engine.mjs";
import { extractRelevantRAGinfo } from "../../../../ai/rag/extractRelevantRAGInfo.mjs";

// Traitement des prompts avec du RAG
// Le prompt doit contenir une ligne avec : !RAG: {contenu} {url:zerzerezr url:zerzer}
export async function processPromptWithRAG(chatbot, content) {
	let question = "";
	let topRAGinformations = "";
	const RAGline = content.split("\n").find((line) => line.includes("!RAG:"));
	if (RAGline) {
		const blockMatches = [...RAGline.matchAll(/{([^{}]+)}/g)];

		if (blockMatches.length >= 2) {
			question = blockMatches[0][1].trim();

			const optionsList = blockMatches[1][1];
			const regex = /(\w+):(\[[^\]]*\]|"[^"]*"|'[^']*'|[^\s]+)/g;
			const options = {};
			let match;

			while ((match = regex.exec(optionsList)) !== null) {
				const key = match[1].trim();
				let value = match[2].trim();

				// Si c'est une liste [...], convertir en tableau
				if (value.startsWith("[") && value.endsWith("]")) {
					const arrayContent = value
						.slice(1, -1)
						.split(",")
						.map((v) => v.trim());
					options[key] = arrayContent;
				} else {
					// Enlever les guillemets s'il y en a
					if (
						(value.startsWith('"') && value.endsWith('"')) ||
						(value.startsWith("'") && value.endsWith("'"))
					) {
						value = value.slice(1, -1);
					}
					options[key] = value;
				}
			}
			const RAGinformations = options.url
				? await getRAGcontent(options.url)
				: "";
			topRAGinformations = extractRelevantRAGinfo(chatbot, question, {
				RAG: RAGinformations,
			});
		}
	}
	return { content: content, RAGinformations: topRAGinformations };
}
