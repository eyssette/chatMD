let nextMessageOnlyIfKeywords = false;
let getLastMessage = false;
function processCustomVariables(message,customVariables,isUser) {
	// Cas où le message vient du bot
	if (!isUser) {
		// On traite le cas des assignations de valeurs à une variable, et on masque dans le texte ces assignations
		message = message.replaceAll(
			/\`@([^\s]*?) ?= ?(?<!@)(.*?)\`/g,
			function (match, variableName, variableValue) {
				if (!match.includes("calc(") && !match.includes("@INPUT")) {
					customVariables[variableName] = variableValue;
					return "";
				} else {
					return match;
				}
			}
		);
		// On remplace dans le texte les variables `@nomVariable` par leur valeur
		message = message.replaceAll(
			/\`@([^\s]*?)\`/g,
			function (match, variableName) {
				if (match.includes("=")) {
					return match;
				} else {
					return customVariables[variableName]
						? customVariables[variableName]
						: '';
				}
			}
		);
		// Calcul des variables qui dépendent d'autres variables
		const hasComplexVariable = message.includes("calc(") ? true : false;
		message = message.replaceAll(
			/\`@([^\s]*?) ?= ?calc\((.*)\)\`/g,
			function (match, variableName, complexExpression) {
				calc = complexExpression.replace(
					/@(\w+)/g,
					(matchCalc, variableNameComplexExpression) => {
						return customVariables[variableNameComplexExpression] || matchCalc;
					}
				);
				customVariables[variableName] = calc;
				return "";
			}
		);

		// Si on a des variables complexes : 2e passage pour remplacer dans le texte les variables `@nomVariable` par leur valeur (qui vient d'être définie)
		if (hasComplexVariable) {
			message = message.replaceAll(
				/\`@([^\s]*?)\`/g,
				function (match, variableName) {
					if (match.includes("=")) {
						return match;
					} else {
						return customVariables[variableName]
							? customVariables[variableName]
							: "";
					}
				}
			);
		}

		// On masque dans le texte les demandes de définition d'une variable par le prochain Input
		message = message.replaceAll(
			/\`@([^\s]*?) ?= ?@INPUT : (.*)\`/g,
			function (match, variableName, nextAnswer) {
				getLastMessage = match ? [variableName, nextAnswer] : false;
				return "";
			}
		);

		// Possibilité d'activer ou de désactiver le clavier au cas par cas
		if (yamlUserInput === false) {
			if (customVariables["KEYBOARD"] == "true") {
				document.body.classList.remove("hideControls");
				customVariables["KEYBOARD"] = "false";
			} else {
				document.body.classList.add("hideControls");
			}
		} else {
			if (customVariables["KEYBOARD"] == "false") {
				document.body.classList.add("hideControls");
				customVariables["KEYBOARD"] = "true";
			} else {
				document.body.classList.remove("hideControls");
			}
		}
		// Au lieu de récupérer l'input, on peut récupérer le contenu d'un bouton qui a été cliqué et on assigne alors ce contenu à une variable : pour cela on intègre la variable dans le bouton, et on la masque avec la classe "hidden"
		message = message.replaceAll(
			/ (@[^\s]*?\=.*?)\</g,
			'<span class="hidden">$1</span><'
		);
		message = message.replaceAll(
			/>(@[^\s]*?\=)/g,
			'><span class="hidden">$1</span>'
		);
		// Traitement du cas où on a l'affichage d'un contenu est conditionné par la valeur d'une variable
		message = message.replaceAll(
			/\`if (.*?)\`((\n|.*)*?)\`endif\`/g,
			function (match, condition, content) {
				if (condition) {
					try {
						// Remplace les variables personnalisées dans la condition
						condition = condition.replace(
							/@([^\s()&|!=]+)/g,
							function (match, varName) {
								return 'customVariables["' + varName.trim() + '"]';
							}
						);
						// Gestion des valeurs si elles ne sont pas mises entre guillemets + gestion du cas undefined
						condition = condition
							.replaceAll(
								/(==|!=|<|>) ?(.*?) ?(\)|\&|\||$)/g,
								function (
									match,
									comparisonSignLeft,
									value,
									comparisonSignRight
								) {
									return `${comparisonSignLeft}"${value}" ${comparisonSignRight}`;
								}
							)
							.replaceAll('""', '"')
							.replace('"undefined"', "undefined");
						// Vérifie que l'expression ne contient que les opérateurs autorisés
						const isValid =
							/^(\s*(!|\(|\)|&&|\|\||==|!=|===|!==|<=|>=|<|>|true|false|null|undefined|[0-9]+|[+-]?([0-9]*[.])?[0-9]+|"[^"]*"|'[^']*'|`[^`]*`|[a-zA-Z0-9_]+\[[^\]]+\]|\s+))*\s*$/.test(
								condition
							);
						if (!isValid) {
							throw new Error("Invalid expression");
						} else {
							// Évaluation de la condition de manière sécurisée
							const result = new Function(
								"customVariables",
								"return " + condition
							)(customVariables);
							return result ? content : "";
						}
					} catch (e) {
						console.error("Error evaluating condition:", condition, e);
						return "<!--" + condition + "-->";
					}
				} else {
					return "";
				}
			}
		);
		// On nettoie le message en supprimant les lignes vides en trop
		message = message.replaceAll(/\n\n\n*/g, "\n\n");
	} else {
		// Cas où le message vient de l'utilisateur

		// Traitement du cas où on a dans le message une assignation de variable (qui vient du fait qu'on a cliqué sur une option qui intégrait cette demande d'assignation de variable)
		message = message.replaceAll(
			/@([^\s]*?)\=(.*)/g,
			function (match, variableName, variableValue, offset) {
				customVariables[variableName] = variableValue;
				// S'il n'y avait pas de texte en plus de la valeur de la variable, on garde la valeur de la variable dans le bouton, sinon on l'enlève
				return offset == 0 ? variableValue : "";
			}
		);

		if (getLastMessage) {
			// Si dans le précédent message, on avait demandé à récupérer l'input : on récupère cette input et on le met dans la variable correspondante
			// Puis on renvoie vers le message correspondant
			if (getLastMessage && getLastMessage.length > 0) {
				customVariables[getLastMessage[0]] = message;
				nextMessage = getLastMessage[1];
				getLastMessage = false;
			} else {
				nextMessage = "";
			}
		} else {
			nextMessage = nextMessageOnlyIfKeywords ? nextMessage : "";
		}
	}
	return message;
}
