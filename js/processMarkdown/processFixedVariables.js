import { yaml } from "./yaml";
import { getRandomElement } from "../utils/arrays";

// Gestion des variables fixes : soit avant de parser le markdown, soit après
export function processFixedVariables(content, preprocess = false) {
	// Les variables fixes qui commencent par _ sont traitées avant de parser le contenu du Markdown
	const regex = preprocess ? /@{(_\S+)}/g : /@{(\S+)}/g;
	return content.replaceAll(
		regex,
		function (match, variableName, positionMatch) {
			const positionLastMatch = content.lastIndexOf(match);
			if (yaml.variables && yaml.variables[variableName]) {
				const variableValue = yaml.variables[variableName];
				const variableValueSplit = variableValue.split("///");
				const variableValueChoice = getRandomElement(variableValueSplit);
				if (preprocess && positionMatch == positionLastMatch) {
					// Les variables fixes qui ont été traitées au tout début, avant de parser le contenu du Markdown, sont ensuite supprimés.
					delete yaml.variables[variableName];
				}
				return variableValueChoice;
			} else {
				return "@{" + variableName + "}";
			}
		},
	);
}
