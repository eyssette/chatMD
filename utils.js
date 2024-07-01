// Pour tirer au hasard un élément dans un tableau
function getRandomElement(array) {
	return array[Math.floor(Math.random() * array.length)];
}

// Gestion des variables fixes : soit avant de parser le markdown, soit après
function processVariables(content, preprocess = false) {
	// Les variables fixes qui commencent par _ sont traitées avant de parser le contenu du Markdown
	const regex = preprocess ? /@{(_\S+)}/g : /@{(\S+)}/g
	return content.replaceAll(regex, function (match, variableName) {
		if (yamlData && yamlData.variables && yamlData.variables[variableName]) {
			const variableValue = yamlData.variables[variableName];
			const variableValueSplit = variableValue.split("///");
			const variableValueChoice = getRandomElement(variableValueSplit);
			if(preprocess) {
				// Les variables fixes qui ont été traitées au tout début, avant de parser le contenu du Markdown, sont ensuite supprimés.
				delete yamlData.variables[variableName];
			}
			return variableValueChoice;
		} else {
			return "@{" + variableName + "}";
		}
	});
}