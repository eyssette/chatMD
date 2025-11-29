import { yaml } from "../../../markdown/custom/yaml.mjs";
import { processRandomMessage } from "../../../markdown/custom/random.mjs";
import { processFixedVariables } from "../../../../js/markdown/custom/variablesFixed.mjs";
import { processDynamicVariables } from "../../../../js//markdown/custom/variablesDynamic.mjs";
import { processGeolocation } from "./processGeolocation.mjs";

export async function processVariables(chatbot, message, isUser) {
	let dynamicVariables = chatbot.dynamicVariables;
	// Gestion des variables fixes prédéfinies
	if (yaml && yaml.variables) {
		message = processFixedVariables(message, yaml);
	}
	if (!isUser) {
		message = processRandomMessage(message);
		if (yaml && yaml.geolocation) {
			const isMessageWithGeolocationVariable =
				message.indexOf("@LATITUDE") > -1 ||
				message.indexOf("@LONGITUDE") > -1 ||
				message.indexOf("@POSITION_ACCURACY") > -1;
			if (isMessageWithGeolocationVariable) {
				await processGeolocation(chatbot);
			}
		}
	}

	if (yaml && yaml.dynamicContent) {
		// On traite les variables dynamiques
		message = processDynamicVariables(
			chatbot,
			message,
			dynamicVariables,
			isUser,
		);
	}
	return message;
}
