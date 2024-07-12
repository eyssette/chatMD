let nextMessageOnlyIfKeywords = false;
let getLastMessage = false;
function processDynamicVariables(message,dynamicVariables,isUser) {
	// Cas où le message vient du bot
	if (!isUser) {
		// On traite le cas des assignations de valeurs à une variable, et on masque dans le texte ces assignations
		message = message.replaceAll(
			/\`@([^\s]*?) ?= ?(?<!@)(.*?)\`/g,
			function (match, variableName, variableValue) {
				if (!match.includes("calc(") && !match.includes("@INPUT")) {
					dynamicVariables[variableName] = variableValue;
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
					return dynamicVariables[variableName]
						? dynamicVariables[variableName]
						: match;
				}
			}
		);
		// Calcul des variables qui dépendent d'autres variables
		const hasComplexVariable = message.includes("calc(") ? true : false;
		message = message.replaceAll(
			/\`@([^\s]*?) ?= ?calc\((.*)\)\`/g,
			function (match, variableName, complexExpression) {
				// Remplace "@variableName" par la variable correspondante, en la convertissant en nombre si c'est possible
				calc = complexExpression.replace(
					/@(\w+)/g,
					function (match, varName) {
						return 'tryConvertStringToNumber(dynamicVariables["' + varName.trim() + '"])';
					}
				);
				// Sanitize code
				calc = sanitizeCode(calc);
				// Évalue le résultat
				const calcResult = new Function(
					"dynamicVariables",
					"return " + calc
				)(dynamicVariables);
				dynamicVariables[variableName] = calcResult;
				return "";
			}
		);

		// Si on a des variables complexes ou s'il reste des variables sans assignation de valeur : 2e passage pour remplacer dans le texte les variables `@nomVariable` par leur valeur (qui vient d'être définie)
		if (hasComplexVariable || message.includes("`@")) {
			message = message.replaceAll(
				/\`@([^\s]*?)\`/g,
				function (match, variableName) {
					if (match.includes("=")) {
						return match;
					} else {
						return dynamicVariables[variableName]
							? dynamicVariables[variableName]
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
			if (dynamicVariables["KEYBOARD"] == "true") {
				document.body.classList.remove("hideControls");
				dynamicVariables["KEYBOARD"] = "false";
			} else {
				document.body.classList.add("hideControls");
			}
		} else {
			if (dynamicVariables["KEYBOARD"] == "false") {
				document.body.classList.add("hideControls");
				dynamicVariables["KEYBOARD"] = "true";
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
								return 'dynamicVariables["' + varName.trim() + '"]';
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
								"dynamicVariables",
								"return " + condition
							)(dynamicVariables);
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
				dynamicVariables[variableName] = variableValue;
				// S'il n'y avait pas de texte en plus de la valeur de la variable, on garde la valeur de la variable dans le bouton, sinon on l'enlève
				return offset == 0 ? variableValue : "";
			}
		);

		if (getLastMessage) {
			// Si dans le précédent message, on avait demandé à récupérer l'input : on récupère cette input et on le met dans la variable correspondante
			// Puis on renvoie vers le message correspondant
			if (getLastMessage && getLastMessage.length > 0) {
				dynamicVariables[getLastMessage[0]] = message;
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
