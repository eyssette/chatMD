import { yaml } from "../../markdown/custom/yaml.mjs";
import { handleURL } from "../../utils/urls.mjs";
import { createVector } from "../../utils/nlp.mjs";
import { localRAGinformations } from "./sources.mjs";
import {
	fetchContent,
	fetchContentFromMultipleSources,
} from "../../core/chatbot/helpers/fetch.mjs";

function prepareRAGdata(informations, separator) {
	if (separator) {
		if (separator == "auto") {
			// Une fonction pour découper le texte en morceaux d'environ 600 caractères.
			function splitIntoChunks(text, charLimit = 600) {
				let chunks = [];
				let startIndex = 0;
				while (startIndex < text.length) {
					let endIndex = startIndex + charLimit;
					if (endIndex < text.length) {
						let spaceIndex = text.lastIndexOf(" ", endIndex);
						if (spaceIndex > startIndex) {
							endIndex = spaceIndex;
						}
					}
					chunks.push(text.slice(startIndex, endIndex).trim());
					startIndex = endIndex + 1;
				}
				return chunks;
			}
			return splitIntoChunks(informations);
		} else {
			return yaml.useLLM.RAGseparator == "break"
				? informations
						.split("---")
						.map((element) => element.replaceAll("\n", " ").trim())
				: informations.split(yaml.useLLM.RAGseparator);
		}
	} else {
		return informations.split("\n").filter((line) => line.trim() !== "");
	}
}

export let RAGcontent = [];
export let vectorRAGinformations = [];

function createVectorRAGinformations(informations) {
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

export async function getRAGcontent(informations) {
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
				RAGcontent = prepareRAGdata(data, yaml.useLLM.RAGseparator);
				const RAGvectors = createVectorRAGinformations(RAGcontent);
				return RAGvectors;
			} catch (error) {
				console.error(
					"Erreur lors du fetch ou du traitement des données RAG :",
					error,
				);
				return null;
			}
		} else {
			let RAGinformations;
			if (informations.toString().includes("useFile")) {
				RAGinformations = localRAGinformations.trim();
			} else {
				RAGinformations = informations.trim();
			}
			RAGcontent = prepareRAGdata(RAGinformations, yaml.useLLM.RAGseparator);
			const RAGvectors = createVectorRAGinformations(RAGcontent);
			return RAGvectors;
		}
	}
}
