import { sendButton } from "../../../shared/selectors.mjs";

export function handleKeyboardVisibility(yaml, dynamicVariables) {
	if (yaml && yaml.userInput === false) {
		// Cas où le clavier est désactivé par défaut
		if (dynamicVariables["KEYBOARD"] == "true") {
			// Cas où dans une réponse on décide d'afficher le clavier
			sendButton.innerHTML = "Envoyer";
			document.body.classList.remove("hideControls");
			dynamicVariables["KEYBOARD"] = "false";
		} else {
			sendButton.innerHTML = "Afficher tout";
			document.body.classList.add("hideControls");
		}
	} else {
		// Cas où le clavier est activé par défaut
		if (dynamicVariables["KEYBOARD"] == "false") {
			// Cas où dans une réponse on décide de désactiver le clavier
			sendButton.innerHTML = "Afficher tout";
			document.body.classList.add("hideControls");
			dynamicVariables["KEYBOARD"] = "true";
		} else {
			sendButton.innerHTML = "Envoyer";
			document.body.classList.remove("hideControls");
		}
	}
}
