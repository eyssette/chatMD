// Plugin pour lire un fichier CSV, filtrer les données en fonction d'une condition, et les afficher avec un template

import { evaluateExpression } from "../../../../markdown/custom/variablesDynamic/evaluateExpression.mjs";
import { parseCsv } from "../../../../utils/csv.mjs";
import { shuffleArray } from "../../../../utils/arrays.mjs";

// Cache pour les expressions transformées (évite de reparser les mêmes conditions)
const expressionCache = new Map();
const MAX_EXPRESSION_CACHE = 100;

// Transforme une expression de filtre contenant des placeholders $1, $2 …
// et des conditions de type "==" ou "<" …
// en une expression javascript sécurisée qui sera évaluée avec evaluateExpression
function transformExpression(expr) {
	// Vérifier le cache
	if (expressionCache.has(expr)) {
		return expressionCache.get(expr);
	}

	const transformed = expr.replace(/\$(\d+)/g, (_, index) => {
		// Convertit l'index de placeholder $n en index de tableau
		const i = parseInt(index, 10) - 1;
		// Remplace $n par un accès sécurisé à la colonne correspondante de la ligne
		// avec conversion automatique en nombre si nécessaire
		return `tryConvertStringToNumber(dynamicVariables.row[${i}])`;
	});

	// Ajouter au cache
	if (expressionCache.size >= MAX_EXPRESSION_CACHE) {
		const firstKey = expressionCache.keys().next().value;
		expressionCache.delete(firstKey);
	}
	expressionCache.set(expr, transformed);

	return transformed;
}

// Filtre un tableau de données en fonction d'une expression conditionnelle.
// Chaque ligne du tableau est testée avec l'expression fournie
// qui peut utiliser des placeholders $1, $2, ...
// correspondant aux colonnes de la ligne.
function filterTable(table, expr) {
	// Transforme l'expression avec $1, $2... en version sécurisée
	const safeExpr = transformExpression(expr);

	// Fonction de test pour chaque ligne
	const filteredRows = [];
	for (let i = 0; i < table.length; i++) {
		// On filtre le tableau avec cette fonction de test
		if (evaluateExpression(safeExpr, { row: table[i] })) {
			filteredRows.push(table[i]);
		}
	}
	return filteredRows;
}

// Cache pour les valeurs converties (évite de reconvertir les mêmes valeurs)
const conversionCache = new Map();
const MAX_CONVERSION_CACHE = 1000;

// Fonction pour convertir les valeurs d'un tableau de données dans leur bon format (nombre, date ou chaîne de caractères), afin de permettre un tri de ces données
function convertValue(val, type) {
	const cacheKey = `${val}_${type}`;

	if (conversionCache.has(cacheKey)) {
		return conversionCache.get(cacheKey);
	}

	let converted;
	if (type === "num") {
		converted =
			typeof val === "string" ? parseFloat(val.replace(",", ".")) || 0 : val;
	} else if (type === "date") {
		converted = new Date(val);
	} else {
		converted = String(val);
	}

	// Ajouter au cache
	if (conversionCache.size >= MAX_CONVERSION_CACHE) {
		const firstKey = conversionCache.keys().next().value;
		conversionCache.delete(firstKey);
	}
	conversionCache.set(cacheKey, converted);

	return converted;
}

// Cache pour les règles de tri parsées
const sortRulesCache = new Map();
const MAX_SORT_RULES_CACHE = 50;

// Tri un tableau de données en fonction d'une formule de tri
// Syntaxe : $<colonne> [asc|desc] [num|alph|date]
// Exemple : "$1 asc num, $3 desc alph"
function parseSortFormula(sortFormula) {
	if (sortRulesCache.has(sortFormula)) {
		return sortRulesCache.get(sortFormula);
	}

	const rules = sortFormula
		.split(",")
		.map((crit) => {
			const parts = crit.trim().split(/\s+/);
			const orderPart = parts.find((p) => /^(asc|desc)$/i.test(p));
			const typePart = parts.find((p) => /^(num|alph|date)$/i.test(p));
			return {
				colIndex: parseInt(parts[0].slice(1)) - 1,
				order: orderPart ? orderPart.toLowerCase() : "asc",
				type: typePart ? typePart.toLowerCase() : "alph",
			};
		})
		.filter((rule) => !isNaN(rule.colIndex));

	// Ajouter au cache
	if (sortRulesCache.size >= MAX_SORT_RULES_CACHE) {
		const firstKey = sortRulesCache.keys().next().value;
		sortRulesCache.delete(firstKey);
	}
	sortRulesCache.set(sortFormula, rules);

	return rules;
}

function sortTable(data, sortFormula) {
	const rules = parseSortFormula(sortFormula);

	// Crée une copie uniquement si nécessaire
	return data.sort((a, b) => {
		for (let i = 0; i < rules.length; i++) {
			const { colIndex, order, type } = rules[i];
			const valA = convertValue(a[colIndex], type);
			const valB = convertValue(b[colIndex], type);

			let comparison;
			if (type === "alph") {
				// Si c'est un tri alphabétique, on le fait par défaut en français, sans prendre en compte la casse, et en prenant en compte les nombres
				comparison = valA.localeCompare(valB, "fr", {
					sensitivity: "base",
					numeric: true,
				});
			} else {
				comparison = valA < valB ? -1 : valA > valB ? 1 : 0;
			}
			// Si on doit trier en sens inverse
			if (comparison !== 0) {
				return order === "asc" ? comparison : -comparison;
			}
		}
		return 0;
	});
}

// Cache pour les templates compilés
const templateCache = new Map();
const MAX_TEMPLATE_CACHE = 100;

// Remplace les marqueurs de type $1, $2, … dans un template texte par les valeurs correspondantes provenant d'un tableau de lignes.
// Chaque placeholder $n est remplacé par la valeur de la colonne correspondante.
// On peut aussi utiliser $i pour insérer le numéro de ligne
function compileTemplate(template) {
	if (templateCache.has(template)) {
		return templateCache.get(template);
	}

	// Pré-identifier tous les placeholders une seule fois
	const placeholders = [];
	const regex = /\$(\d+|i)/g;
	let match;
	while ((match = regex.exec(template)) !== null) {
		placeholders.push({
			fullMatch: match[0],
			// Convertit l'index de placeholder $n en index de tableau sauf pour $i
			index: match[1] === "i" ? "i" : parseInt(match[1], 10) - 1,
		});
	}

	const compiled = { template, placeholders };

	// Ajouter au cache
	if (templateCache.size >= MAX_TEMPLATE_CACHE) {
		const firstKey = templateCache.keys().next().value;
		templateCache.delete(firstKey);
	}
	templateCache.set(template, compiled);

	return compiled;
}

function fillTemplateFromValuesFromArray(template, sourceArray) {
	const { placeholders } = compileTemplate(template);

	const results = new Array(sourceArray.length);

	for (let rowIndex = 0; rowIndex < sourceArray.length; rowIndex++) {
		const row = sourceArray[rowIndex];
		let result = template;

		// Remplacer les placeholders
		for (let i = 0; i < placeholders.length; i++) {
			const { fullMatch, index } = placeholders[i];
			const value =
				index === "i"
					? // Remplace $i par le numéro de ligne
						String(rowIndex + 1)
					: // Remplace $n par la valeur de la colonne correspondante ou vide si inexistante
						row[index] !== undefined && row[index] !== null
						? row[index]
						: "";
			result = result.replace(fullMatch, value);
		}

		results[rowIndex] = result;
	}

	return results.join("\n").trim().replaceAll("\\n", "\n");
}

// Cache pour les CSV téléchargés (évite de télécharger plusieurs fois le même fichier)
const csvCache = new Map();
const MAX_CSV_CACHE = 20;

async function getCachedCsv(url) {
	if (csvCache.has(url)) {
		return csvCache.get(url);
	}

	const csvObject = await parseCsv(url);

	if (csvObject) {
		// Ajouter au cache
		if (csvCache.size >= MAX_CSV_CACHE) {
			const firstKey = csvCache.keys().next().value;
			csvCache.delete(firstKey);
		}
		csvCache.set(url, csvObject);
	}

	return csvObject;
}

// Traite un message contenant des blocs CSV au format markdown, commençant par : ```readcsv URL, optionnellement suivi d'une condition, et d'un template de texte
// Pour chaque bloc trouvé :
// 1. Télécharge et parse le CSV depuis l'URL spécifiée.
// 2. Récupère les instructions spéciales (condition pour filtrer les données, tri, maxResults, random) et les applique aux données
// 3. Remplit le template avec les valeurs des lignes
// 4. Remplace le bloc original dans le message par le résultat formaté.
export async function processCsv(message) {
	// Regex pour détecter tous les blocs ```readcsv URL ... ```
	const regex = /```readcsv (.*)\n((.|\n)*?)```/gm;
	const matches = [...message.matchAll(regex)];

	// Télécharger tous les CSV en parallèle
	const csvPromises = matches.map(([, url]) => getCachedCsv(url));
	const csvObjects = await Promise.all(csvPromises);

	// Traiter chaque bloc
	for (let i = 0; i < matches.length; i++) {
		const [fullMatch, , codeBlockContent] = matches[i];
		const csvObject = csvObjects[i];

		if (csvObject) {
			let data = csvObject.data.slice(1); // Copie et supprime la ligne d'en-têtes

			const linesCodeBlock = codeBlockContent.split("\n");

			let condition = null;
			let sortFormula = null;
			let maxResults = null;
			let isRandom = false;
			// Filtrer les lignes pour récupérer les instructions spéciales
			const templateLines = [];
			for (let j = 0; j < linesCodeBlock.length; j++) {
				const trimmedLine = linesCodeBlock[j].trim();
				if (trimmedLine.startsWith("condition:")) {
					// Récupère la condition (après "condition: ")
					condition = trimmedLine.slice(10).trim();
				} else if (trimmedLine.startsWith("sort:")) {
					// Récupère le critère de tri (après "sort: ")
					sortFormula = trimmedLine.slice(5).trim();
				} else if (trimmedLine.startsWith("maxResults:")) {
					// Récupère le nombre maximum de résultats à afficher (après "maxResults: ")
					maxResults = parseInt(trimmedLine.slice(11).trim(), 10);
				} else if (trimmedLine === "random: true") {
					// Récupère l'option random (après "random: ")
					isRandom = true;
				} else {
					templateLines.push(linesCodeBlock[j]);
				}
			}

			const template = templateLines.join("\n").trim();

			// Si une condition est présente, filtre les données du CSV
			if (condition) {
				data = filterTable(data, condition);
			}

			// Si maxResults est petit et qu'on a beaucoup de données, limiter avant de trier
			const shouldLimitBeforeSort = maxResults && data.length > maxResults * 10;

			if (isRandom) {
				// Si l'option random est activée, on réordonne les données de manière aléatoire
				data = shuffleArray(data);
				if (shouldLimitBeforeSort && maxResults) {
					data = data.slice(0, maxResults);
				}
			}

			// S'il y a un tri particulier des résultats à respecter, on applique ce tri aux données filtrées
			if (sortFormula) {
				data = sortTable(data, sortFormula);
			}

			// Si un nombre maximum de lignes est spécifié, on limite les données à ce nombre
			if (maxResults && !shouldLimitBeforeSort) {
				data = data.slice(0, maxResults);
			}

			// S'il n'y a pas de données, on remplace le bloc par une chaîne vide
			if (data.length === 0) {
				message = message.replace(fullMatch, "");
				continue;
			}

			// Remplit le template avec les valeurs des lignes filtrées
			const result = fillTemplateFromValuesFromArray(template, data);

			// Remplace le bloc original dans le message par le résultat formaté
			message = message.replace(fullMatch, result);
		} else {
			// Si le parsing du fichier a échoué, on remplace le bloc par un message d'erreur
			const errorMessage = `\n⚠️ Erreur d'accès aux données\n`;
			message = message.replace(fullMatch, errorMessage);
		}
	}

	return message;
}
