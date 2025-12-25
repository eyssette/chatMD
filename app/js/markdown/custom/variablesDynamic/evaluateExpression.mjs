import { config } from "../../../config.mjs";
import { tryConvertStringToNumber } from "../../../utils/strings.mjs";
import { mainTopic } from "../../../utils/nlp.mjs";

// Opérations autorisées pour le calcul des expressions complexes
const sanitizeCodeAllowedOperations = [
	"+",
	"-",
	"*",
	"/",
	"%",
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
	"Math.abs",
	"Math.min",
	"Math.max",
	"Math.round",
	".length",
	".includes",
	".startsWith",
	".endsWith",
	".toLowerCase",
	".toUpperCase",
	".trim",
	",",
	".",
	"[",
	"]",
	"?",
	":",
	"true",
	"false",
	"tryConvertStringToNumber",
	"dynamicVariables",
	"mainTopic",
];

// Nettoie une formule de test avant exécution dynamique (new Function).
// Le but est de supprimer toute tentative d’injection de code non autorisé.
function sanitizeCode(code) {
	// On va d'abord enlever dans la formule tout ce qui est autorisé
	// Pour pouvoir repérer à la fin ce qu'il faut supprimer

	// On supprime d'abord dans l'expression les variables dynamiques, qui sont autorisées
	let codeWithoutAllowedOperations = code.replace(
		/tryConvertStringToNumber\(.*?\]\)/g,
		"",
	);

	// On supprime les chaînes de caractères entre guillemets, qui sont autorisées
	codeWithoutAllowedOperations = codeWithoutAllowedOperations.replace(
		/".*?"/g,
		"///",
	);

	// On supprime les opérations autorisées
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

	// On peut alors repérer les fragments interdits
	const forbiddenExpressions = codeWithoutAllowedOperations
		.split("///")
		.map((exp) => exp.trim()) // On ne doit pas retirer les espaces
		.filter((exp) => exp && exp !== "undefined"); // On ne doit pas retirer la formule "undefined"

	// On retire ces fragments interdits du code initial
	for (const forbidden of forbiddenExpressions) {
		code = code.replaceAll(forbidden, "");
	}
	return code;
}

export function evaluateExpression(expression, dynamicVariables) {
	// Si on est déjà dans le mode sécurisé (contrôle de la source des chatbots), on n'a pas besoin de sanitizer le code ; sinon, on sanitize le code
	expression = config.secureMode ? expression : sanitizeCode(expression);
	const result = new Function(
		"dynamicVariables",
		"tryConvertStringToNumber",
		"mainTopic",
		"return " + expression,
	)(dynamicVariables, tryConvertStringToNumber, mainTopic);
	return result;
}
