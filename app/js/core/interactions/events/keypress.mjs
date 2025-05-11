import { sendButton, userInput } from "../../../shared/selectors.mjs";
import { goToNewChatbot } from "../../../utils/urls.mjs";
import { scrollWindow } from "../../../utils/ui.mjs";
import { adjustFooterToInputHeight } from "./helpers/adjustFooterToInputHeight.mjs";
import { insertLineBreak } from "./helpers/insertLineBreak.mjs";
import { getNumberOfLines } from "./helpers/getNumberOfLines.mjs";

export function setKeypressListener() {
	document.addEventListener("keydown", (event) => {
		const modal = document.querySelector("#systemModal");
		// Si la fenêtre modale est ouverte
		if (modal) {
			// On désactive l'entrée clavier dans la zone texte
			event.preventDefault();
			// Mais si on appuie sur “Escape”, on sort de la fenêtre modale
			if (event.key === "Escape") {
				document.body.removeChild(modal);
			}
		}
		// Si on clique sur Entrée
		if (event.key === "Enter") {
			const isSpecialKey = event.ctrlKey || event.altKey || event.shiftKey;
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
			// Sinon, on vérifie ce qui peut changer la hauteur de la zone de texte afin d'adapter si nécessaire la visibilité du footer
			// Cela peut être : appui sur une touche de suppression de contenu ou appui sur n'importe quelle touche qui ajoute du contenu et qui fait que l'on dépasse un nombre maximum de lignes
			if (event.target == userInput) {
				if (
					event.key === "Delete" ||
					event.key === "Backspace" ||
					getNumberOfLines(userInput) > 2
				) {
					adjustFooterToInputHeight();
				}
			}
		}
	});
}
