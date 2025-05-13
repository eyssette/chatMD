import { yaml } from "../../../markdown/custom/yaml.mjs";
import { processAudio } from "../../../markdown/custom/directives/audio.mjs";
import { processDirectiveNext } from "../../../markdown/custom/directives/next.mjs";
import { processDirectiveSelectNext } from "../../../markdown/custom/directives/selectNext.mjs";
import { processDirectiveBot } from "../../../markdown/custom/directives/bot.mjs";
import { processDirectiveKeyboard } from "../../../markdown/custom/directives/keyboard.mjs";

export function processDirectives(chatbot, message, container) {
	// Gestion de la directive !Bot: botName
	if (yaml && yaml.bots) {
		message = processDirectiveBot(message, container);
	}

	// Gestion de l'audio
	message = processAudio(message);

	// Gestion de la directive !Next: Titre réponse / message si mauvaise réponse
	message = processDirectiveNext(chatbot, message);

	// Gestion de la directive !SelectNext pour sélectionner aléatoirement le prochain message du chatbot
	message = processDirectiveSelectNext(chatbot, message);

	// Gestion de la directive !Keyboard : possibilité d'activer ou de désactiver le clavier au cas par cas
	message = processDirectiveKeyboard(message, yaml, chatbot.dynamicVariables);

	return message;
}
