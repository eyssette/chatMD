import { sendButton, userInput } from "../../../shared/selectors.mjs";
import { goToNewChatbot } from "../../../utils/urls.mjs";
import { scrollWindow } from "../../../utils/ui.mjs";
import { adjustFooterToInputHeight } from "./helpers/adjustFooterToInputHeight.mjs";

// Pour insérer un retour à la ligne dans la zone de texte (quand on appuie sur Clic+Enter ou Alt+Enter)
function insertLineBreak() {
	const selection = window.getSelection();
	if (!selection || selection.rangeCount === 0) return;

	const range = selection.getRangeAt(0);
	range.deleteContents();

	// Crée un <br> et un nœud vide après pour que le curseur ait une vraie position
	const br = document.createElement("br");
	const space = document.createTextNode("\u200B"); // zéro-width space

	range.insertNode(space);
	range.insertNode(br);

	// Place le curseur après l'espace
	range.setStartAfter(space);
	range.collapse(true);
	selection.removeAllRanges();
	selection.addRange(range);
}

export function setKeypressListener() {
	document.addEventListener("keydown", (event) => {
		// Si on clique sur Entrée
		if (event.key === "Enter") {
			const isSpecialKey = event.ctrlKey || event.altKey;
			// Si on n'a pas utilisé de touche spéciale en combinaison avec Entrée (Clic+Enter ou Alt+Enter)
			if (!isSpecialKey) {
				event.preventDefault();
				// Si on est dans le champ input qui permet de rediriger vers un chatbot à partir de l'URL de sa source : on va vers le chatbot avec la bonne adresse
				if (event.target.id == "urlSourceChatbot") {
					const urlNewChatbot = event.target.value.trim();
					goToNewChatbot(urlNewChatbot);
				} else {
					// Sinon, on fait comme si on faisait un clic sur le bouton Envoyer, ce qui permet d'envoyer sa réponse (s'il y a du contenu), ou de faire tout apparaître d'un coup, et de désactiver l'effet typewriter, s'il n'y a pas de contenu.
					userInput.focus();
					sendButton.click();
					scrollWindow({ scrollMode: "instant" });
				}
			} else {
				// Si on a utilisé Clic+Enter ou Alt+Enter, alors on insère un retour à la ligne dans la zone de texte et on cache si nécessaire le footer
				if (event.target == userInput) {
					event.preventDefault();
					insertLineBreak();
					adjustFooterToInputHeight();
				}
			}
		} // Si on a appuyé sur une autre touche qu'Enter
		else if (
			userInput.parentElement.parentElement.classList.contains("hideControls")
		) {
			// Si l'userInput est caché : on désactive l'entrée clavier (sauf pour Enter qui permet toujours d'afficher plus vite la suite)
			event.preventDefault();
		} else {
			// Sinon, on regarde si on a appuyé sur une touche de suppression de contenu pour vérifier la hauteur de la zone de texte et adapter si nécessaire la visibilité du footer
			if (event.key === "Delete" || event.key === "Backspace") {
				adjustFooterToInputHeight();
			}
		}
	});
}
