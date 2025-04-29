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

// Pour créer des chunkjs entourés de backticks
// chunkSize définit le nombre de caractères maximum de chaque chunk
export function chunkWithBackticks(string, chunkSize = 5) {
	if (!string) return "";

	const chunks = [];
	for (let i = 0; i < string.length; i += chunkSize) {
		const substring = string.slice(i, i + chunkSize);
		chunks.push("`" + substring + "`");
	}
	return chunks.join("");
}

function isBacktickWrapped(string) {
	return string.startsWith("`") && string.endsWith("`");
}
function hasPauseMarker(string) {
	return /\^\d+/.test(string);
}

// Pour découper un texte en chunks de N caractères (afin de l'afficher plus rapidement), sans découper les balises HTML et sans découper le texte qui est déjà entre des backticks
export function splitHtmlIntoChunks(html, chunkSize) {
	// Divise le texte sur les backticks
	const parts = html.split(/(`[^`]*`)/);
	// Traite chaque partie
	const processedParts = parts.map((part) => {
		// Si la partie est entre backticks, on la garde telle quelle
		if (isBacktickWrapped(part)) {
			return part;
		} else {
			let processed = part;

			// Cas 1 : texte entre balises HTML
			processed = processed.replace(/>([^<]*)</g, (match, textBetweenTags) => {
				const processedText = hasPauseMarker(textBetweenTags)
					? textBetweenTags
					: chunkWithBackticks(textBetweenTags, chunkSize);
				return `>${processedText}<`;
			});

			// Cas 2 : il reste une balise HTML ouvrante en début (mais il n'y avait pas de balise HTML fermante)
			processed = processed.replace(/>([^<]*)$/, (match, text) => {
				const processedText = hasPauseMarker(text)
					? text
					: chunkWithBackticks(text, chunkSize);
				return match.replace(text, processedText);
			});

			// Cas 3 : il reste une balise HTML fermante à la fin (mais il n'y avait pas de balise HTML ouvrante)
			processed = processed.replace(/^([^<]*)<.*$/, (match, text) => {
				const processedText = hasPauseMarker(text)
					? text
					: chunkWithBackticks(text, chunkSize);
				return match.replace(text, processedText);
			});

			return processed;
		}
	});
	return processedParts.join("");
}
