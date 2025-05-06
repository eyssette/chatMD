import { footerElement, userInput } from "../../../../shared/selectors.mjs";

function getHeightInEm(element) {
	const heightPx = element.offsetHeight;
	const fontSizePx = parseFloat(getComputedStyle(element).fontSize);
	return heightPx / fontSizePx;
}

// Ajuste la visibilité du footer en fontion de la taille de l'input
// Permet à l'utilisateur d'entrer plus qu'une seule ligne du texte
// Permet au footer de ne pas apparaître au-dessus de la zone de texte quand celle-ci dépasse une ligne
export function adjustFooterToInputHeight() {
	if (footerElement) {
		setTimeout(() => {
			const heightInput = getHeightInEm(userInput);
			if (heightInput && heightInput > 3) {
				footerElement.style.opacity = "0";
			} else {
				footerElement.style.opacity = "1";
			}
		}, 100);
	}
}
