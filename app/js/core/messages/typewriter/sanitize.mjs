export function removeTypewriterPauses(html) {
	return html.replace(/\^\d+/g, "");
}

export function removeInstantDisplayDelimiters(html) {
	return html.replaceAll("`", "");
}

export function cleanTypewriterSyntax(html) {
	return removeTypewriterPauses(removeInstantDisplayDelimiters(html));
}
