import { evaluateExpression } from "./evaluateExpression.mjs";

// Si on utilise un bloc conditionnel cette fonction permet de vérifier la condition associée à ce bloc
export function checkConditionalBlock(condition, dynamicVariables) {
	try {
		// Remplace les variables personnalisées dans la condition
		condition = condition.replace(
			/@([^\s()&|!=<>]+)/g,
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
					return `${comparisonSignLeft}"${value}" ${comparisonSignRight}`;
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
