import { evaluateExpression } from "./evaluateExpression.mjs";
import { evaluateSelector } from "./helpers/evaluateSelector.mjs";

// Si on utilise un bloc conditionnel cette fonction permet de vérifier la condition associée à ce bloc
export function checkConditionalBlock(
	block,
	dynamicVariables,
	cumulativeOutput,
) {
	let condition = block.condition;
	try {
		// Remplace les variables personnalisées dans la condition

		// (1) On traite d'abord le cas des variables @SELECTOR["cssSelector"]
		condition = condition.replace(
			/@SELECTOR\["([^"]+)"\]/g,
			function (match, cssSelector) {
				const value = evaluateSelector(cssSelector, cumulativeOutput);
				// Si on a trouvé une valeur, on l'utilise directement
				if (value !== "") {
					// Si on a trouvé une valeur, on teste si c'est un bloc spécial
					const isSpecialBlock =
						value.includes("readcsv") || value.includes("!useLLM");
					if (isSpecialBlock) {
						// Si c'est un bloc spécial, on indique qu'il faut une évaluation différée de la condition avec le sélecteur
						return `!DIFFER_EVALUATION:SELECTOR["${cssSelector}"]`;
					}
					return '"' + value.replaceAll('"', '\\"').replace(/\n/g, " ") + '"';
				} else {
					// Si on n'a pas trouvé de valeur, on indique qu'il faut une évaluation différée de la condition avec le sélecteur
					return `!DIFFER_EVALUATION:SELECTOR["${cssSelector}"]`;
				}
			},
		);
		// Gestion du cas où la condition nécessite une évaluation différée
		if (condition.includes("!DIFFER_EVALUATION")) {
			return {
				result: condition.replace("!DIFFER_EVALUATION:", "@"),
				differEvaluation: true,
			};
		}

		// S'il n'y a pas d'évaluation différée, on continue le traitement

		// (2) On traite le cas des variables simples @variableName
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
		return {
			result: evaluateExpression(condition, dynamicVariables),
			differEvaluation: false,
		};
	} catch (e) {
		console.error("Error evaluating condition:", condition, e);
		return { result: false, differEvaluation: false };
	}
}
