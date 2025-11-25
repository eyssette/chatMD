import { getLastElement } from "../../../../utils/dom.mjs";

// Évalue un sélecteur CSS sur un contenu HTML donné et retourne le texte de l'élément trouvé
export function evaluateSelector(cssSelector, htmlContent) {
	// On crée un élément temporaire qui contient le contenu HTML fourni
	const tempElement = document.createElement("div");
	tempElement.innerHTML = htmlContent;
	// On le rend complètement invisible et hors du flux
	tempElement.style.cssText =
		"position: absolute; visibility: hidden; pointer-events: none;";
	// On ajoute temporairement cet élément au document
	document.body.appendChild(tempElement);
	// Maintenant on cherche le dernier élément qui correspond au sélecteur CSS dans tout le document en incluant l'élément temporaire
	const selectorAppliedToDocument = getLastElement(cssSelector, document);
	let value = selectorAppliedToDocument
		? selectorAppliedToDocument.textContent.trim()
		: "";
	// On retire l'élément temporaire du document
	document.body.removeChild(tempElement);
	return value;
}
