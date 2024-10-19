// Pour vérifier si une variable texte commence par un élément d'un tableau
export function startsWithAnyOf(string, array) {
	for (const element of array) {
		if (string.startsWith(element)) {
			return element;
		}
	}
}

export function tryConvertStringToNumber(input) {
	const number = parseFloat(input);
	if (!isNaN(number) && number.toString() === input.toString().trim()) {
		return number;
	} else {
		return input;
	}
}

export function hasSentenceEndMark(string) {
	string = string.trim();
	if (string.length === 0) {
		return false;
	}
	const lastChar = string[string.length - 1];
	// Vérifie si c'est une marque de fin de phrase
	return lastChar === "." || lastChar === "!" || lastChar === "?";
}
