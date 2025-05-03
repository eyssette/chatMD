import { shuffleArray } from "../../../utils/arrays.mjs";

// Gestion de la directive "!Select: x" : on sélectionne aléatoirement seulement x options dans l'ensemble des options disponibles
export function processDirectiveSelect(response, options) {
	response = response.replaceAll(/!Select ?: ?([0-9]*)/g, function (match, v1) {
		if (match && v1 <= options.length) {
			options = shuffleArray(options).slice(0, v1);
			return "<!--" + match + "-->";
		} else {
			return "";
		}
	});
	return [response, options];
}
