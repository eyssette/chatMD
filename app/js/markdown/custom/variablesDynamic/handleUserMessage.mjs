import { processComplexDynamicVariables } from "./complexDynamicVariables.mjs";

export function handleUserMessage(
	chatbot,
	message,
	dynamicVariables,
	getLastMessage,
) {
	// Cas où le message vient de l'utilisateur
	// Traitement du cas où on a dans le message une assignation de variable (qui vient du fait qu'on a cliqué sur une option qui intégrait cette demande d'assignation de variable)
	message = message.replaceAll(
		/@([^\s]*?)=(.*)/g,
		function (match, variableName, variableValue, offset) {
			if (match.includes("calc(")) {
				try {
					// Calcule l'expression complexe
					const complexExpression = variableValue
						.replace("calc(", "")
						.trim()
						.slice(0, -1);
					const calcResult = processComplexDynamicVariables(
						complexExpression,
						dynamicVariables,
					);
					dynamicVariables[variableName] = calcResult;
				} catch (e) {
					console.error("Error evaluating :", match, e);
					return "<!--" + match + "-->";
				}
			} else {
				dynamicVariables[variableName] = variableValue;
			}
			// S'il n'y avait pas de texte en plus de la valeur de la variable, on garde la valeur de la variable dans le bouton, sinon on l'enlève
			return offset == 0 ? variableValue : "";
		},
	);

	// On enregistre le dernier message de l'utilisateur dans la variable dynamique INPUT.
	dynamicVariables["INPUT"] = message;

	if (getLastMessage) {
		// Compatibilité avec l'ancienne syntaxe `@variable = @INPUT : redirection` pour récupérer l'input de l'utilisateur et l'assigner à une variable
		// Si dans le précédent message, on avait demandé à récupérer l'input : on récupère cet input et on le met dans la variable correspondante
		// puis on renvoie vers le message correspondant
		if (getLastMessage && getLastMessage.length > 0) {
			dynamicVariables[getLastMessage[0]] = message;
			chatbot.nextMessage.goto = getLastMessage[1];
			getLastMessage = false;
		} else {
			chatbot.nextMessage.goto = "";
		}
	} else {
		chatbot.nextMessage.goto = chatbot.nextMessage.onlyIfKeywords
			? chatbot.nextMessage.goto
			: "";
	}
	return [message, getLastMessage];
}
