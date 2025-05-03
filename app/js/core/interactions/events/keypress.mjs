import { sendButton, userInput } from "../../../shared/selectors.mjs";
import { goToNewChatbot } from "../../../utils/urls.mjs";
import { scrollWindow } from "../../../utils/ui.mjs";

export function setKeypressListener() {
	document.addEventListener("keypress", (event) => {
		if (event.key === "Enter") {
			event.preventDefault();
			if (event.target.id == "urlSourceChatbot") {
				const urlNewChatbot = event.target.value.trim();
				goToNewChatbot(urlNewChatbot);
			} else {
				userInput.focus();
				sendButton.click();
				scrollWindow({ scrollMode: "instant" });
			}
		} else if (
			userInput.parentElement.parentElement.classList.contains("hideControls")
		) {
			// Si l'userInput est caché : on désactive l'entrée clavier (sauf pour Enter qui permet toujours d'afficher plus vite la suite)
			event.preventDefault();
		}
	});
}
