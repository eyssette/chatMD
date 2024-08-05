import { yaml } from "../yaml";
import { handleURL } from "../utils";
import { createVector } from "../nlp";

function prepareRAGdata(informations, separator) {
	if(separator) {
		if(separator == "auto") {
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
			return yaml.useLLM.RAGseparator == "break" ? informations.split("---").map(element => element.replaceAll("\n"," ").trim()) : informations.split(yaml.useLLM.RAGseparator);
		}
	} else {
		return informations.split("\n").filter(line => line.trim() !== "");
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


export function getRAGcontent(informations) {
	if(informations) {
		if(informations.includes("http")) {
			const urlRAGfile = handleURL(informations);
			fetch(urlRAGfile)
				.then((response) => response.text())
				.then((data) => {
					RAGcontent = prepareRAGdata(data, yaml.useLLM.RAGseparator);
					const RAGvectors = createVectorRAGinformations(RAGcontent);
					return RAGvectors;
				});
		} else {
			let RAGinformations;
			if(informations.toString().includes("useFile")) {
				RAGinformations = RAGinformations.trim();
				yaml.useLLM.RAGinformations = prepareRAGdata(RAGinformations, yaml.useLLM.RAGseparator);
			} else {
				RAGinformations = informations.trim();
				yaml.useLLM.RAGinformations = prepareRAGdata(RAGinformations, yaml.useLLM.RAGseparator);
			}
			return yaml.useLLM.RAGinformations;
		}
	}
}