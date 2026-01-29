import { config } from "../../../config.mjs";
import { tryConvertStringToNumber } from "../../../utils/strings.mjs";
import { mainTopic, normalizeText, searchScore } from "../../../utils/nlp.mjs";

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
	"{",
	"}",
	"encodeURI",
	"Math.abs",
	"Math.min",
	"Math.max",
	"Math.round",
	"Math",
	".length",
	".includes",
	".startsWith",
	".endsWith",
	".toLowerCase",
	".toUpperCase",
	".trim",
	"JSON.parse",
	"JSON",
	"replace",
	"replaceAll",
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
	"normalizeText",
	"searchScore",
	"boostWords",
];

// Regex pour identifier les parties autorisées dans le code
const REGEX_DYNAMIC_VARS = /tryConvertStringToNumber\(.*?\]\)/g;
const REGEX_STRINGS = /".*?"/g;
const REGEX_OBJECT_PROPS = /\.[a-zA-Z0-9_]+/g;
const REGEX_DECIMALS = /[0-9]+\.[0-9]+/g;
const REGEX_NUMBERS = /[0-9]*/g;

// Expressions importantes à bloquer
const importantExpressionsToBlock = [
	"eval",
	"new Function",
	"require",
	"process.",
	"global.",
	"window.",
	"alert",
	"fetch",
	"XMLHttpRequest",
	"setTimeout",
	"setInterval",
];

// Cache pour les expressions déjà sanitizées (évite de re-sanitizer la même expression)
const sanitizeCache = new Map();
const MAX_CACHE_SIZE = 100;

function sanitizeCode(code) {
	// Vérifier le cache
	if (sanitizeCache.has(code)) {
		return sanitizeCache.get(code);
	}

	// S'il y a un des termes interdits, on bloque directement
	for (let i = 0; i < importantExpressionsToBlock.length; i++) {
		if (code.includes(importantExpressionsToBlock[i])) {
			throw new Error(
				"Expression contains disallowed operation: " +
					importantExpressionsToBlock[i],
			);
		}
	}

	// On retire les expressions autorisées de l'expression initiale : les variables dynamiques, les chaînes de caractères, les propriétés d'objets, les nombres (décimaux et entiers)

	let codeWithoutAllowedOperations = code
		.replace(REGEX_DYNAMIC_VARS, "")
		.replace(REGEX_STRINGS, "///")
		.replace(REGEX_OBJECT_PROPS, "///")
		.replace(REGEX_DECIMALS, "///")
		.replace(REGEX_NUMBERS, "");

	for (let i = 0; i < sanitizeCodeAllowedOperations.length; i++) {
		codeWithoutAllowedOperations = codeWithoutAllowedOperations.replaceAll(
			sanitizeCodeAllowedOperations[i],
			"///",
		);
	}

	// On peut alors repérer les fragments interdits
	const parts = codeWithoutAllowedOperations.split("///");
	const forbiddenExpressions = [];
	for (let i = 0; i < parts.length; i++) {
		const trimmed = parts[i].trim();
		if (trimmed && trimmed !== "undefined") {
			forbiddenExpressions.push(trimmed);
		}
	}

	// On retire ces fragments interdits du code initial
	let sanitizedCode = code;
	for (let i = 0; i < forbiddenExpressions.length; i++) {
		sanitizedCode = sanitizedCode.replaceAll(forbiddenExpressions[i], "");
	}

	// Ajouter au cache (avec limitation de taille)
	if (sanitizeCache.size >= MAX_CACHE_SIZE) {
		const firstKey = sanitizeCache.keys().next().value;
		sanitizeCache.delete(firstKey);
	}
	sanitizeCache.set(code, sanitizedCode);

	return sanitizedCode;
}

// Cache pour les fonctions compilées
const functionCache = new Map();
const MAX_FUNCTION_CACHE_SIZE = 50;

export function evaluateExpression(expression, dynamicVariables) {
	// Si mode sécurisé, pas besoin de sanitizer
	const finalExpression = config.secureMode
		? expression
		: sanitizeCode(expression);

	// Vérifier le cache de fonctions
	let fn = functionCache.get(finalExpression);

	if (!fn) {
		fn = new Function(
			"dynamicVariables",
			"tryConvertStringToNumber",
			"mainTopic",
			"normalizeText",
			"searchScore",
			"return " + finalExpression,
		);

		// Ajouter au cache (avec limitation de taille)
		if (functionCache.size >= MAX_FUNCTION_CACHE_SIZE) {
			const firstKey = functionCache.keys().next().value;
			functionCache.delete(firstKey);
		}
		functionCache.set(finalExpression, fn);
	}

	return fn(
		dynamicVariables,
		tryConvertStringToNumber,
		mainTopic,
		normalizeText,
		searchScore,
	);
}
