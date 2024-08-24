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
