import { evaluateExpression } from "./evaluateExpression.mjs";

export function processComplexDynamicVariables(
	complexExpression,
	dynamicVariables,
) {
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
