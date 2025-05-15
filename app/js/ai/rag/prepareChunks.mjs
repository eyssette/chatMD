function splitByCharLimit(text, maxChars) {
	const chunks = [];
	let start = 0;

	while (start < text.length) {
		let end = Math.min(start + maxChars, text.length);

		if (end < text.length) {
			const space = text.lastIndexOf(" ", end);
			if (space > start) {
				end = space;
			}
		}

		const chunk = text.slice(start, end).trim();
		if (chunk) chunks.push(chunk);

		start = end;
		// saute l'espace suivant si présent
		while (text[start] === " ") start++;
	}

	return chunks;
}

function splitByCustomSeparator(text, separator) {
	return text.split(separator);
}

function splitByNewLines(text) {
	return text
		.split(/\n/)
		.map((line) => line.trim())
		.filter((line) => line !== "");
}

function splitByMarkdownHr(text) {
	return text
		.split("---")
		.map((section) => section.trim())
		.filter((section) => section.length > 0);
}

function splitByParagraphs(text) {
	return text
		.split(/\r?\n\s*\r?\n/)
		.map((paragraph) => paragraph.trim())
		.filter((paragraph) => paragraph !== "");
}

export function prepareChunksForRAG(text, options) {
	const separator = options && options.separator;

	if (!separator || separator == "line") return splitByNewLines(text);
	if (separator == "maxchars" || separator == "auto") {
		const maxChars = options.maxChars || 600;
		return splitByCharLimit(text, maxChars);
	}
	if (separator == "break") return splitByMarkdownHr(text);
	if (separator == "paragraph") return splitByParagraphs(text);
	return splitByCustomSeparator(text, separator);
}
