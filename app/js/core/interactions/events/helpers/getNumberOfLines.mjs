function getWidthInEm(element) {
	const widthPx = element.offsetWidth;
	const fontSizePx = parseFloat(getComputedStyle(element).fontSize);
	return widthPx / fontSizePx;
}

function getNumberOfCharachters(element) {
	return element.textContent.length;
}

export function getNumberOfLines(element) {
	const numberOfCharacters = getNumberOfCharachters(element);
	const averageCharacterWidthInEm = 0.5;
	const elementWidthInEm = getWidthInEm(element);
	const totalWidthInEm = numberOfCharacters * averageCharacterWidthInEm;
	const numberOfLines = totalWidthInEm / elementWidthInEm;
	return numberOfLines;
}
