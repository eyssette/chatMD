import { yaml } from "../../markdown/custom/yaml.mjs";
import { handleURL } from "../../utils/urls.mjs";
import { createVector } from "../../utils/nlp.mjs";
import { localRAGinformations } from "./sources.mjs";
import {
	fetchContent,
	fetchContentFromMultipleSources,
} from "../../core/chatbot/helpers/fetch.mjs";
import { prepareChunksForRAG } from "./prepareChunks.mjs";

function createVectorRAGinformations(informations) {
	let vectorRAGinformations = [];
	if (informations) {
		const informationsLength = informations.length;
		for (let i = 0; i < informationsLength; i++) {
			const RAGinformation = informations[i];
			const vectorRAGinformation = createVector(RAGinformation);
			vectorRAGinformations.push(vectorRAGinformation);
		}
		return vectorRAGinformations;
	}
}

export async function getRAGcontent(informations, options) {
	const separator =
		options && options.separator ? options.separator : yaml.useLLM.RAGseparator;
	let RAGcontent;
	if (informations) {
		const isArray = Array.isArray(informations);
		if (isArray || informations.includes("http")) {
			let sourceRAG;
			if (isArray) {
				sourceRAG = informations.map((element) =>
					handleURL(element, { useCorsProxy: true }),
				);
			} else {
				sourceRAG = handleURL(informations, { useCorsProxy: true });
			}
			try {
				const data = isArray
					? await fetchContentFromMultipleSources(sourceRAG)
					: await fetchContent(sourceRAG);
				RAGcontent = prepareChunksForRAG(data, {
					separator: separator,
				});
				const RAGvector = createVectorRAGinformations(RAGcontent);
				return { content: RAGcontent, vector: RAGvector };
			} catch (error) {
				console.error(
					"Erreur lors du fetch ou du traitement des données RAG :",
					error,
				);
				return { content: [], vector: [] };
			}
		} else {
			let RAGinformations;
			if (informations.toString().includes("useFile")) {
				RAGinformations = localRAGinformations.trim();
			} else {
				RAGinformations = informations.trim();
			}
			RAGcontent = prepareChunksForRAG(RAGinformations, {
				separator: separator,
			});
			const RAGvector = createVectorRAGinformations(RAGcontent);
			return { content: RAGcontent, vector: RAGvector };
		}
	}
}
