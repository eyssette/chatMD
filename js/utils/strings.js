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

export function hasSentenceEndMark(str) {
	const trimmed = str.trim();
	const lastChar = trimmed.slice(-1);
	return [".", "!", "?", "…"].includes(lastChar);
}

export function sanitizeHtml(html, allowedTags) {
	return html.replace(/<[^>]+>/g, (tag) => {
		return allowedTags.includes(tag) ? tag : "";
	});
}
