import { getLastElement } from "../../../utils/dom.mjs";
import { evaluateExpression } from "./evaluateExpression.mjs";

// Si on utilise un bloc conditionnel cette fonction permet de vérifier la condition associée à ce bloc
export function checkConditionalBlock(condition, dynamicVariables) {
	try {
		// Remplace les variables personnalisées dans la condition

		// On traite d'abord le cas des variables @SELECTOR["cssSelector"]
		condition = condition.replace(
			/@SELECTOR\["([^"]+)"\]/g,
			function (match, cssSelector) {
				const element = getLastElement(cssSelector, document);
				const value = element ? element.textContent.trim() : "";
				return 'tryConvertStringToNumber("' + value.replace(/"/g, '\\"') + '")';
			},
		);

		// Puis on traite le cas des variables simples @variableName
		condition = condition.replace(
			/@([\p{L}0-9_]+)/gu,
			function (match, varName) {
				return (
					'tryConvertStringToNumber(dynamicVariables["' + varName.trim() + '"])'
				);
			},
		);
		// Gestion des valeurs si elles ne sont pas mises entre guillemets + gestion du cas undefined
		condition = condition
			.replaceAll(
				/(==|!=|<=|>=|<|>) ?(.*?) ?(\)|&|\||$)/g,
				function (match, comparisonSignLeft, value, comparisonSignRight) {
					const isComparisonWithDynamicVariables =
						value.includes("dynamicVariables");
					return isComparisonWithDynamicVariables
						? `${comparisonSignLeft}${value} ${comparisonSignRight}`
						: `${comparisonSignLeft}"${value}" ${comparisonSignRight}`;
				},
			)
			.replaceAll('""', '"')
			.replace('"undefined"', "undefined");
		// Évalue l'expression de manière sécurisée
		const result = evaluateExpression(condition, dynamicVariables);
		return result;
	} catch (e) {
		console.error("Error evaluating condition:", condition, e);
		return false;
	}
}
