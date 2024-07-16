function prepareRAGdata(informations, separator) {
	if(separator) {
		if(separator == 'auto') {
			// Une fonction pour découper le texte en morceaux d'environ 600 caractères.
			function splitIntoChunks(text, charLimit = 600) {
				let chunks = [];
				let startIndex = 0;
				while (startIndex < text.length) {
					let endIndex = startIndex + charLimit;
					if (endIndex < text.length) {
						let spaceIndex = text.lastIndexOf(' ', endIndex);
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
			return yamlUseLLM.separator == 'break' ? informations.split('---').map(element => element.replaceAll('\n',' ').trim()) : informations.split(yamlUseLLM.separator);
		}
	} else {
		return informations.split('\n').filter(line => line.trim() !== '');
	}
}

async function getRAGcontent(informations) {
	if(informations) {
		yamlUseLLMmaxTopElements = yamlUseLLM.maxTopElements ? yamlUseLLM.maxTopElements : 3;
		if(informations.includes('http')) {
			const urlRAGfile = handleURL(informations);
			yamlUseLLMinformations = await fetch(urlRAGfile)
				.then((response) => response.text())
				.then((data) => {
					return prepareRAGdata(data, yamlUseLLM.separator);
				})
		} else {
			if(informations.toString().includes("useFile")) {
				RAGinformations = RAGinformations.trim();
				yamlUseLLMinformations = prepareRAGdata(RAGinformations, yamlUseLLM.separator);
			} else {
				RAGinformations = informations.trim();
				yamlUseLLMinformations = prepareRAGdata(RAGinformations, yamlUseLLM.separator);
			}
			return yamlUseLLMinformations
		}
	}
}