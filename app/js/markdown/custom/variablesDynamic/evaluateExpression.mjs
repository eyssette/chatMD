import { config } from "../../../config.mjs";
import { tryConvertStringToNumber } from "../../../utils/strings.mjs";

// Opérations autorisées pour le calcul des expressions complexes
const sanitizeCodeAllowedOperations = [
	"+",
	"-",
	"*",
	"/",
	"<=",
	">=",
	"<",
	">",
	"==",
	"!=",
	"&&",
	"||",
	"!",
	"(",
	")",
	"encodeURI",
];

// Sanitize le code avant d'utiliser new Function
function sanitizeCode(code) {
	// On supprime d'abord dans l'expression les variables dynamiques
	let codeWithoutAllowedOperations = code.replace(
		/tryConvertStringToNumber\(.*?\]\)/g,
		"",
	);
	// On supprime ensuite les opérations autorisées
	sanitizeCodeAllowedOperations.forEach((allowedOperation) => {
		codeWithoutAllowedOperations = codeWithoutAllowedOperations.replaceAll(
			allowedOperation,
			"///",
		);
	});
	// On supprime aussi tous les nombres (ils sont autorisés)
	codeWithoutAllowedOperations = codeWithoutAllowedOperations.replace(
		/[0-9]*/g,
		"",
	);
	// On supprime les chaînes de caractères entre guillemets
	codeWithoutAllowedOperations = codeWithoutAllowedOperations.replace(
		/".*?"/g,
		"///",
	);
	// Ne reste plus qu'une suite de caractères non autorisées qu'on va supprimer dans le code
	const forbiddenExpressions = codeWithoutAllowedOperations.split("///");
	forbiddenExpressions.forEach((forbiddenExpression) => {
		if (!forbiddenExpression.includes("undefined")) {
			code = code.replaceAll(forbiddenExpression, "");
		}
	});
	return code;
}

export function evaluateExpression(expression, dynamicVariables) {
	// Si on est déjà dans le mode sécurisé (contrôle de la source des chatbots), on n'a pas besoin de sanitizer le code ; sinon, on sanitize le code
	expression = config.secureMode ? expression : sanitizeCode(expression);
	const result = new Function(
		"dynamicVariables",
		"tryConvertStringToNumber",
		"return " + expression,
	)(dynamicVariables, tryConvertStringToNumber);
	return result;
}
