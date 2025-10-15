// Plugin pour lire un fichier CSV, filtrer les données en fonction d'une condition, et les afficher avec un template

import { evaluateExpression } from "../../../../markdown/custom/variablesDynamic/evaluateExpression.mjs";

// Lit un fichier CSV en ligne avec Papaparse et renvoie le tableau des données
async function parseCsv(url) {
	return new Promise((resolve, reject) => {
		window.Papa.parse(url, {
			download: true,
			skipEmptyLines: true,
			transform: (value) => {
				return value.trim();
			},
			complete: (results) => {
				return resolve(results);
			},
			error: () => {
				return reject(null);
			},
		});
	});
}

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
	const [headers, ...rows] = table;

	// Transforme l'expression avec $1, $2... en version sécurisée
	const safeExpr = transformExpression(expr);

	// Fonction de test pour chaque ligne
	const rowMatchesCondition = (row) => {
		return evaluateExpression(safeExpr, { row });
	};

	// On filtre le tableau avec cette fonction de test
	const filteredRows = rows.filter(rowMatchesCondition);
	return [headers, ...filteredRows];
}

// Remplace les marqueurs de type $1, $2, … dans un template texte par les valeurs
// correspondantes provenant d'un tableau de lignes.
// Chaque placeholder $n est remplacé par la valeur de la colonne correspondante
function fillTemplateFromValuesFromArray(template, sourceArray) {
	// Fonction interne pour remplacer les placeholders dans une ligne
	const replaceFn = (row) =>
		template.replace(/\$(\d+)/g, (_, index) => {
			// Convertit l'index de placeholder $n en index de tableau
			const i = parseInt(index, 10) - 1;
			// Remplace le placeholder par la valeur correspondante de la colonne ou par une chaîne vide s'il n'y a pas de valeur
			return row[i] !== undefined && row[i] !== null ? row[i] : "";
		});

	// Applique la transformation à chaque ligne du tableau
	const result = sourceArray.map((row) => replaceFn(row));
	return result.join("\n").trim();
}

// Traite un message contenant des blocs CSV au format markdown, commençant par : ```readcsv URL, optionnellement suivi d'une condition, et d'un template de texte
// Pour chaque bloc trouvé :
// 1. Télécharge et parse le CSV depuis l'URL spécifiée.
// 2. Cherche une ligne commençant par "condition:" pour filtrer les données.
// 3. Supprime la ligne "condition:" du template si elle existe.
// 4. Applique la condition (si présente) pour filtrer les lignes du CSV.
// 5. Remplit le template avec les valeurs des lignes restantes.
// 6. Remplace le bloc original dans le message par le résultat formaté.
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

			const linesCodeBlock = codeBlockContent.split("\n");

			let condition = null;
			// Filtrer les lignes pour récupérer la condition si elle existe
			const templateLines = linesCodeBlock.filter((line) => {
				if (line.trim().startsWith("condition:")) {
					// Récupère la condition (tout après "condition:")
					condition = line.replace(/^condition:\s*/, "");
					return false; // exclut la ligne condition du template
				}
				return true; // conserve toutes les autres lignes
			});

			const template = templateLines.join("\n").trim();

			// Si une condition est présente, filtre les données du CSV
			if (condition) {
				data = filterTable(data, condition);
				data.shift(); // supprime la ligne d'en-têtes après le filtrage
			}

			// Remplit le template avec les valeurs des lignes filtrées
			const result = fillTemplateFromValuesFromArray(template, data);

			// Remplace le bloc original dans le message par le résultat formaté
			message = message.replace(fullMatch, result);
		}
	}

	return message;
}
