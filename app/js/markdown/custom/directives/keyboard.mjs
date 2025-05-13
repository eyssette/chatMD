import { sendButton, controlsElement } from "../../../shared/selectors.mjs";

export function processDirectiveKeyboard(message, yaml, dynamicVariables) {
	const match = message.match(/!Keyboard\s*:\s*(true|false)/i);
	if (match) {
		message = message.replace(match[0], "");
		const useKeyboard = match[1].toLowerCase() === "true";
		dynamicVariables["KEYBOARD"] = useKeyboard ? "true" : "false";
	}
	if (yaml && yaml.userInput === false) {
		// Cas où le clavier est désactivé par défaut
		if (dynamicVariables["KEYBOARD"] == "true") {
			// Cas où dans une réponse on décide d'afficher le clavier
			sendButton.innerHTML = "Envoyer";
			document.body.classList.remove("hideControls");
			if (yaml.footer === false) {
				controlsElement.style.setProperty("height", "110px", "important");
			}
			dynamicVariables["KEYBOARD"] = "false";
		} else {
			sendButton.innerHTML = "Afficher tout";
			document.body.classList.add("hideControls");
			if (yaml.footer === false) {
				controlsElement.style.setProperty("height", "50px", "important");
			}
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
	return message;
}
