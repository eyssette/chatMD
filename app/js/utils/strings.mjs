// Pour vérifier si une variable texte commence par un élément d'un tableau
export function startsWithAnyOf(string, array) {
	for (const element of array) {
		if (string.startsWith(element)) {
			return element;
		}
	}
}

export function tryConvertStringToNumber(input) {
	if (typeof input !== "string") {
		return input;
	}
	const number = parseFloat(input);
	if (!isNaN(number) && number.toString() === input.toString().trim()) {
		return number;
	} else {
		return input;
	}
}

// Pour vérifier si une chaîne de caractère se termine par un signe qui marque la fin d'un texte.
export function hasSentenceEndMark(str) {
	const trimmed = str.trim();
	const lastChar = trimmed.slice(-1);
	return [".", "!", "?", "…", ">"].includes(lastChar);
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

export function encodeString(str) {
	return window.btoa(encodeURIComponent(str));
}

export function decodeString(str) {
	return decodeURIComponent(window.atob(str));
}

// Obfuscation Unicode-safe
export function obfuscateString(str) {
	const bytes = new TextEncoder().encode(str); // UTF-8 encoding
	let binary = "";
	for (const b of bytes) {
		binary += String.fromCharCode(b);
	}
	return btoa(binary);
}

// Désobfuscation Unicode-safe
export function deobfuscateString(str) {
	const binary = atob(str);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return new TextDecoder().decode(bytes); // UTF-8 decoding
}

// Vérifie si une chaîne de caractère se termine par une balise HTML non fermée
export function endsWithUnclosedHtmlTag(str) {
	const lastOpenBracket = str.lastIndexOf("<");
	const lastCloseBracket = str.lastIndexOf(">");

	if (lastOpenBracket === -1 || lastCloseBracket <= lastOpenBracket) {
		return false;
	}

	const contentInsideLastBrackets = str
		.slice(lastOpenBracket + 1, lastCloseBracket)
		.trim();

	return (
		!contentInsideLastBrackets.endsWith("/") &&
		!contentInsideLastBrackets.startsWith("/") &&
		contentInsideLastBrackets !== "br" &&
		contentInsideLastBrackets !== "hr"
	);
}
