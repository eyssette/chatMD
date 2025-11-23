// Récupère le dernier élément HTML dans un élément HTML donné correspondant au sélecteur CSS
export function getLastElement(cssSelector, baseElement = document) {
	const elements = baseElement.querySelectorAll(cssSelector);
	if (elements.length === 0) {
		return null;
	}
	return elements[elements.length - 1];
}
