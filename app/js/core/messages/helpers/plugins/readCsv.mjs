// Plugin pour lire un fichier CSV, filtrer les données en fonction d'une condition, et les afficher avec un template

import { evaluateExpression } from "../../../../markdown/custom/variablesDynamic/evaluateExpression.mjs";
import { parseCsv } from "../../../../utils/csv.mjs";
import { shuffleArray } from "../../../../utils/arrays.mjs";

// Transforme une expression de filtre contenant des placeholders $1, $2 …
// et des conditions de type "==" ou "<" …
// en une expression javascript sécurisée qui sera évaluée avec evaluateExpression
function transformExpression(expr) {
	return expr.replace(/\$(\d+)/g, (_, index) => {
		// Convertit l'index de placeholder $n en index de tableau
		const i = parseInt(index, 10) - 1;
		// Remplace $n par un accès sécurisé à la colonne correspondante de la ligne
		// avec conversion automatique en nombre si nécessaire
		return `tryConvertStringToNumber(dynamicVariables.row[${i}])`;
	});
}

// Filtre un tableau de données en fonction d'une expression conditionnelle.
// Chaque ligne du tableau est testée avec l'expression fournie
// qui peut utiliser des placeholders $1, $2, ...
// correspondant aux colonnes de la ligne.
function filterTable(table, expr) {
	const [...rows] = table;

	// Transforme l'expression avec $1, $2... en version sécurisée
	const safeExpr = transformExpression(expr);

	// Fonction de test pour chaque ligne
	const rowMatchesCondition = (row) => {
		return evaluateExpression(safeExpr, { row });
	};

	// On filtre le tableau avec cette fonction de test
	const filteredRows = rows.filter(rowMatchesCondition);
	return [...filteredRows];
}

// Fonction pour convertir les valeurs d'un tableau de données dans leur bon format (nombre, date ou chaîne de caractères), afin de permettre un tri de ces données
function convertValue(val, type) {
	if (type === "num") {
		return typeof val === "string"
			? parseFloat(val.replace(",", ".")) || 0
			: val;
	}
	if (type === "date") return new Date(val);
	return String(val);
}

// Tri un tableau de données en fonction d'une formule de tri
// Syntaxe : $<colonne> [asc|desc] [num|alph|date]
// Exemple : "$1 asc num, $3 desc alph"
function sortTable(data, sortFormula) {
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

	return [...data].sort((a, b) => {
		for (const { colIndex, order, type } of rules) {
			// On convertit les données dans le bon format (nombre, date, chaîne de caractères) pour pouvoir faire le tri
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
				if (valA < valB) comparison = -1;
				else if (valA > valB) comparison = 1;
				else comparison = 0;
			}
			// Si on doit trier en sens inverse
			if (comparison !== 0) {
				return order === "asc" ? comparison : -comparison;
			}
		}
		return 0;
	});
}

// Remplace les marqueurs de type $1, $2, … dans un template texte par les valeurs correspondantes provenant d'un tableau de lignes.
// Chaque placeholder $n est remplacé par la valeur de la colonne correspondante.
// On peut aussi utiliser $i pour insérer le numéro de ligne
function fillTemplateFromValuesFromArray(template, sourceArray) {
	// Fonction interne pour remplacer les placeholders dans une ligne
	const replaceFn = (row, rowIndex) =>
		template.replace(/\$(\d+|i)/g, (_, index) => {
			if (index === "i") {
				return String(rowIndex + 1);
			}
			// Convertit l'index de placeholder $n en index de tableau
			const i = parseInt(index, 10) - 1;
			// Remplace le placeholder par la valeur correspondante de la colonne ou par une chaîne vide s'il n'y a pas de valeur
			return row[i] !== undefined && row[i] !== null ? row[i] : "";
		});

	// Applique la transformation à chaque ligne du tableau
	const result = sourceArray.map((row, rowIndex) => replaceFn(row, rowIndex));
	return result.join("\n").trim().replaceAll("\\n", "\n");
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

	// Parcourt tous les blocs trouvés
	for (const match of matches) {
		const [fullMatch, url, codeBlockContent] = match;

		// Parse le CSV à partir de l'URL
		const csvObject = await parseCsv(url);
		if (csvObject) {
			let data = csvObject.data;
			data.shift(); // supprime la ligne d'en-têtes

			const linesCodeBlock = codeBlockContent.split("\n");

			let condition = null;
			let sortFormula = null;
			let maxResults = null;
			let isRandom = false;
			// Filtrer les lignes pour récupérer les instructions spéciales
			const templateLines = linesCodeBlock.filter((line) => {
				const trimmedLine = line.trim();
				if (trimmedLine.startsWith("condition:")) {
					// Récupère la condition (après "condition: ")
					condition = trimmedLine.replace(/^condition:\s*/, "");
					return false; // exclut la ligne "condition: "" du template
				}
				if (trimmedLine.startsWith("sort:")) {
					// Récupère le critère de tri (après "sort: ")
					sortFormula = trimmedLine.replace(/^sort:\s*/, "");
					return false; // exclut la ligne "sort: " du template
				}
				if (trimmedLine.startsWith("maxResults:")) {
					// Récupère le nombre maximum de résultats à afficher (après "maxResults: ")
					maxResults = parseInt(trimmedLine.replace(/^maxResults:\s*/, ""), 10);
					return false; // exclut la ligne "max: " du template
				}
				if (trimmedLine.startsWith("random: true")) {
					// Récupère l'option random (après "random: ")
					isRandom = true;
					return false; // exclut la ligne "random: true" du template
				}
				return true; // conserve toutes les autres lignes
			});

			const template = templateLines.join("\n").trim();

			// Si une condition est présente, filtre les données du CSV
			if (condition) {
				data = filterTable(data, condition);
			}

			// S'il y a un tri particulier des résultats à respecter, on applique ce tri aux données filtrées
			if (sortFormula) {
				data = sortTable(data, sortFormula);
			}

			// Si l'option random est activée, on réordonne les données de manière aléatoire
			if (isRandom) {
				data = shuffleArray(data);
			}

			// Si un nombre maximum de lignes est spécifié, on limite les données à ce nombre
			if (maxResults && !isNaN(maxResults)) {
				data = data.slice(0, maxResults);
			}

			// Remplit le template avec les valeurs des lignes filtrées
			const result = fillTemplateFromValuesFromArray(template, data);

			// Remplace le bloc original dans le message par le résultat formaté
			message = message.replace(fullMatch, result);
		}
	}

	return message;
}
