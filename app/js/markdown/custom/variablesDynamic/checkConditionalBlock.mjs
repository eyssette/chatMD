import { getLastElement } from "../../../utils/dom.mjs";
import { evaluateExpression } from "./evaluateExpression.mjs";

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
				const element = getLastElement(cssSelector, document);
				if (element)
					return (
						'"' +
						element.textContent
							.trim()
							.replaceAll('"', '\\"')
							.replace(/\n/g, " ") +
						'"'
					);
				// Sinon, on utilise un élément HTML temporaire pour afficher le message pas encore affiché, et on applique le sélecteur à cet élément,
				const tempElement = document.createElement("div");
				tempElement.innerHTML = cumulativeOutput;
				const selectorAppliedToTempElement = getLastElement(
					cssSelector,
					tempElement,
				);
				let foundText = "";
				if (selectorAppliedToTempElement) {
					foundText = selectorAppliedToTempElement.textContent.trim();
					if (foundText !== "") {
						// Si le texte trouvé est un bloc spécial (readcsv ou !useLLM), on indique qu'il faut une évaluation différée de la condition avec le sélecteur
						const isSpecialBlock =
							foundText.includes("readcsv") || foundText.includes("!useLLM");
						if (isSpecialBlock) {
							return `!DIFFER_EVALUATION:SELECTOR["${cssSelector}"]`;
						}
					}
				}
				// Si l'élément temporaire contenait bien du texte et n'était pas un bloc spécial, on retourne ce texte
				// Sinon, on indique qu'il faut une évaluation différée de la condition avec le sélecteur
				return foundText
					? '"' + foundText.replaceAll('"', '\\"').replace(/\n/g, " ") + '"'
					: `!DIFFER_EVALUATION:SELECTOR["${cssSelector}"]`;
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
