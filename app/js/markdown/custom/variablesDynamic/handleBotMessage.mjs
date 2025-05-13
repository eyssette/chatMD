import { getRandomElement } from "../../../utils/arrays.mjs";
import { evaluateExpression } from "./evaluateExpression.mjs";

function processComplexDynamicVariables(complexExpression, dynamicVariables) {
	// Remplace "@variableName" par la variable correspondante, en la convertissant en nombre si c'est possible
	let calc = complexExpression.replace(/@(\w+)/g, function (match, varName) {
		return (
			'tryConvertStringToNumber(dynamicVariables["' + varName.trim() + '"])'
		);
	});
	// Évalue l'expression de manière sécurisée
	const calcResult = evaluateExpression(calc, dynamicVariables);
	return calcResult;
}

export function handleBotMessage(
	message,
	yaml,
	dynamicVariables,
	getLastMessage,
) {
	// On traite le cas des assignations de valeurs à une variable, et on masque dans le texte ces assignations
	message = message.replaceAll(
		/`@([^\s]*?) ?= ?([^@]*?)`/g,
		function (match, variableName, variableValue) {
			if (!match.includes("calc(") && !match.includes("@INPUT")) {
				const variableValueSplit = variableValue.split("///");
				const variableValueChoice = getRandomElement(variableValueSplit);
				dynamicVariables[variableName] = variableValueChoice;
				return match.includes("KEYBOARD") ? "<!--" + match + "-->" : "";
			} else {
				return match;
			}
		},
	);
	message = message.replaceAll("<!--<!--", "<!--").replaceAll("-->-->", "-->");
	// On remplace dans le texte les variables `@nomVariable` par leur valeur
	message = message.replaceAll(/`@([^\s]*?)`/g, function (match, variableName) {
		if (match.includes("=")) {
			return match;
		} else {
			return dynamicVariables[variableName]
				? dynamicVariables[variableName]
				: match;
		}
	});
	// Calcul des variables qui dépendent d'autres variables
	const hasComplexVariable = message.includes("calc(") ? true : false;
	message = message.replaceAll(
		/`@([^\s]*?) ?= ?calc\((.*)\)`/g,
		function (match, variableName, complexExpression) {
			try {
				// Calcule l'expression complexe
				const calcResult = processComplexDynamicVariables(
					complexExpression,
					dynamicVariables,
				);
				dynamicVariables[variableName] = calcResult;
				return "";
			} catch (e) {
				console.error("Error evaluating :", match, e);
				return "<!--" + match + "-->";
			}
		},
	);

	// Si on a des variables complexes ou s'il reste des variables sans assignation de valeur : 2e passage pour remplacer dans le texte les variables `@nomVariable` par leur valeur (qui vient d'être définie)
	if (hasComplexVariable || message.includes("`@")) {
		message = message.replaceAll(
			/`@([^\s]*?)`/g,
			function (match, variableName) {
				if (match.includes("=")) {
					return match;
				} else {
					return dynamicVariables[variableName]
						? dynamicVariables[variableName]
						: "";
				}
			},
		);
	}

	// On masque dans le texte les demandes de définition d'une variable par le prochain Input
	message = message.replaceAll(
		/`@([^\s]*?) ?= ?@INPUT : (.*)`/g,
		function (match, variableName, nextAnswer) {
			getLastMessage = match ? [variableName, nextAnswer] : false;
			return "";
		},
	);

	// Au lieu de récupérer l'input, on peut récupérer le contenu d'un bouton qui a été cliqué et on assigne alors ce contenu à une variable : pour cela on intègre la variable dans le bouton, et on la masque avec la classe "hidden"
	message = message.replaceAll(
		/ (@[^\s]*?=.*?)</g,
		'<span class="hidden">$1</span><',
	);
	message = message.replaceAll(
		/>(@[^\s]*?=)/g,
		'><span class="hidden">$1</span>',
	);
	// Traitement du cas où on a l'affichage d'un contenu est conditionné par la valeur d'une variable
	message = message.replaceAll(
		/`if (.*?)`((\n|.*)*?)`endif`/g,
		function (match, condition, content) {
			if (condition) {
				try {
					// Remplace les variables personnalisées dans la condition
					condition = condition.replace(
						/@([^\s()&|!=<>]+)/g,
						function (match, varName) {
							return (
								'tryConvertStringToNumber(dynamicVariables["' +
								varName.trim() +
								'"])'
							);
						},
					);
					// Gestion des valeurs si elles ne sont pas mises entre guillemets + gestion du cas undefined
					condition = condition
						.replaceAll(
							/(==|!=|<=|>=|<|>) ?(.*?) ?(\)|&|\||$)/g,
							function (match, comparisonSignLeft, value, comparisonSignRight) {
								return `${comparisonSignLeft}"${value}" ${comparisonSignRight}`;
							},
						)
						.replaceAll('""', '"')
						.replace('"undefined"', "undefined");
					// Évalue l'expression de manière sécurisée
					const result = evaluateExpression(condition, dynamicVariables);
					return result ? content : "";
				} catch (e) {
					console.error("Error evaluating condition:", condition, e);
					return "<!--" + condition + "-->";
				}
			} else {
				return "";
			}
		},
	);
	// On nettoie le message en supprimant les lignes vides en trop
	message = message.replaceAll(/\n\n\n*/g, "\n\n");
	return [message, getLastMessage];
}
