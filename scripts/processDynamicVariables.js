let nextMessageOnlyIfKeywords = false;
let getLastMessage = false;

// Opérations autorisées pour le calcul des expressions complexes
const sanitizeCodeAllowedOperations = [
	'+','-','*','/',
	'<=', '>=',
	'<', '>',
	'==', '!=', 
	'&&', '||', '!',
];

// Sanitize le code avant d'utiliser new Function
function sanitizeCode(code) {
	// On supprime d'abord dans l'expression les variables dynamiques
	codeWithoutAllowedOperations = code.replace(/tryConvertStringToNumber\(.*?\]\)/g,'');
	// On supprime ensuite les opérations autorisées
	sanitizeCodeAllowedOperations.forEach((allowedOperation) => {
		codeWithoutAllowedOperations = codeWithoutAllowedOperations.replaceAll(allowedOperation, "///");
	})
	// On supprime aussi tous les nombres (ils sont autorisés)
	codeWithoutAllowedOperations = codeWithoutAllowedOperations.replace(/[0-9]*/g,'')
	// Ne reste plus qu'une suite de caractères non autorisées qu'on va supprimer dans le code
	forbiddenExpressions = codeWithoutAllowedOperations.split('///')
	forbiddenExpressions.forEach((forbiddenExpression) => {
		code = code.replaceAll(forbiddenExpression,'')
	})
	return code;
}

function processComplexDynamicVariables(complexExpression,dynamicVariables) {
	// Remplace "@variableName" par la variable correspondante, en la convertissant en nombre si c'est possible
	let calc = complexExpression.replace(
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
	return calcResult;
}

function processDynamicVariables(message,dynamicVariables,isUser) {
	// Cas où le message vient du bot
	if (!isUser) {
		// On traite le cas des assignations de valeurs à une variable, et on masque dans le texte ces assignations
		message = message.replaceAll(
			/\`@([^\s]*?) ?= ?(?<!@)(.*?)\`/g,
			function (match, variableName, variableValue) {
				if (!match.includes("calc(") && !match.includes("@INPUT")) {
					dynamicVariables[variableName] = variableValue;
					return match.includes("KEYBOARD") ? "<!--"+match+"-->" : "";
				} else {
					return match;
				}
			}
		);
		message = message.replaceAll('<!--<!--','<!--').replaceAll('-->-->','-->')
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
				try {
					// Calcule l'expression complexe
					const calcResult = processComplexDynamicVariables(complexExpression,dynamicVariables)
					dynamicVariables[variableName] = calcResult;
					return "";
				} catch (e) {
					console.error("Error evaluating :", match, e);
					return "<!--" + match + "-->";
				}
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
								/(==|!=|<=|>=|<|>) ?(.*?) ?(\)|\&|\||$)/g,
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
				if(match.includes('calc(')) {
					try {
						// Calcule l'expression complexe
						const complexExpression = variableValue.replace('calc(','').trim().slice(0, -1);
						const calcResult = processComplexDynamicVariables(complexExpression,dynamicVariables)
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
