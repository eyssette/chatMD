import { getRandomElement } from "../../../utils/arrays.mjs";
import { evaluateExpression } from "./evaluateExpression.mjs";
import { evaluateSelector } from "./helpers/evaluateSelector.mjs";

function processComplexDynamicVariables(complexExpression, dynamicVariables) {
	// Remplace "@variableName" par la variable correspondante, en la convertissant en nombre si c'est possible

	// Cas particulier : si on trouve une variable de type @SELECTOR["cssSelector"], on assigne à dynamicVariables[varName] la chaîne complète pour une évaluation différée
	const selectorMatch = complexExpression.match(/@SELECTOR\["([^"]+)"\]/);
	if (selectorMatch) {
		return complexExpression;
	}

	// Sinon, on remplace les variables par leurs valeurs
	let calc = complexExpression.replace(
		/@([\p{L}0-9_]+)/gu,
		function (match, varName) {
			return (
				'tryConvertStringToNumber(dynamicVariables["' + varName.trim() + '"])'
			);
		},
	);
	// Évalue l'expression de manière sécurisée
	const calcResult = evaluateExpression(calc, dynamicVariables);
	return calcResult;
}

export function processSimpleBlock(message, dynamicVariables) {
	let output = "";
	let index = 0;

	// On recherche toutes les assignations et les emplois de variables
	// Assignations : `@([^\s=`]+?)\s*=\s*([^`]+?)`
	// Emplois : `@([^\s=]+?)`
	const tokenRegex = /`@([^\s=`]+?)\s*=\s*([^`]+?)`|`@([^\s=]+?)`/gs;

	let match;

	// On traite de manière séquentielle les assignations et emplois de variables
	while ((match = tokenRegex.exec(message)) !== null) {
		const fullMatch = match[0];
		const beforeText = message.slice(index, match.index);
		index = match.index + fullMatch.length;

		output += beforeText;

		// [1] ASSIGNATION d'une valeur à une variable : `@name = value`
		if (match[1] !== undefined && match[2] !== undefined) {
			const varName = match[1];
			let rawValue = match[2].trim();

			// cas spécial "@INPUT : "" : on ne le traite pas ici
			if (rawValue.includes("@INPUT : ")) {
				continue;
			}

			// cas des variables complexes avec calc(...)
			if (rawValue.startsWith("calc(") && rawValue.endsWith(")")) {
				const expr = rawValue.slice(5, -1);
				try {
					const calcResult = processComplexDynamicVariables(
						expr,
						dynamicVariables,
					);
					dynamicVariables[varName] = calcResult;
				} catch (e) {
					console.error("Erreur lors du calcul de", fullMatch, e);
					dynamicVariables[varName] = undefined;
				}
			} else {
				// choix avec /// possible
				const parts = rawValue.split("///");
				const chosen = getRandomElement(parts);

				// Remplace les références intérieures (seulement celles déjà définies)
				const resolved = chosen.replace(/`@([^\s=]+)`/g, function (_, ref) {
					return dynamicVariables[ref] !== undefined &&
						dynamicVariables[ref] !== null
						? dynamicVariables[ref]
						: "`@" + ref + "`"; // on laisse la référence à la variable si elle n'est pas définie
				});

				dynamicVariables[varName] = resolved;
			}
			continue;
		}

		// [2] EMPLOI d'une variable : on doit remplacer `@name` par sa valeur
		if (match[3] !== undefined) {
			const varName = match[3];

			// Cas des variables dont la valeur est définie par un @SELECTOR
			const isVariableWithSelector =
				dynamicVariables &&
				dynamicVariables[varName] &&
				dynamicVariables[varName].includes("SELECTOR[");
			if (isVariableWithSelector) {
				const selectorMatch = dynamicVariables[varName].match(
					/SELECTOR\["([^"]+)"\]/,
				);
				if (selectorMatch) {
					const cssSelector = selectorMatch[1];
					let value = evaluateSelector(cssSelector, output);
					if (value !== "") {
						// Si on a trouvé une valeur, on teste si c'est un bloc spécial
						const isSpecialBlock =
							value.includes("readcsv") || value.includes("!useLLM");
						if (!isSpecialBlock) {
							dynamicVariables[varName] = value;
							output += value;
							continue;
						} else {
							output += `\`@${varName}\``;
							continue;
						}
					} else {
						output += `\`@${varName}\``;
						continue;
					}
				} else {
					output += `\`@${varName}\``;
					continue;
				}
			}

			// Cas des variables SELECTOR de type `@SELECTOR["cssSelector"]`
			if (varName.startsWith("SELECTOR")) {
				const selectorMatch = varName.match(/SELECTOR\["([^"]+)"\]/);
				if (selectorMatch) {
					const cssSelector = selectorMatch[1];
					let value = evaluateSelector(cssSelector, output);
					if (value !== "") {
						// Si on a trouvé une valeur, on teste si c'est un bloc spécial
						const isSpecialBlock =
							value.includes("readcsv") || value.includes("!useLLM");
						if (isSpecialBlock) {
							// Si c'est un bloc spécial, on laisse la référence à la variable pour une évaluation différée
							value = `\`@${varName}\``;
						}
						output += value;
						continue;
					} else {
						// Si on n'a rien trouvé, on laisse la référence à la variable
						// Elle sera alors interprétée plus tard au moment de l'affichage
						output += `\`@${varName}\``;
						continue;
					}
				} else {
					// Si le format de la variable SELECTOR est incorrect, on remplace par une chaîne vide
					output += "";
					continue;
				}
			} else {
				// Cas des variables simples `@variableName`
				const value =
					dynamicVariables[varName] !== undefined
						? dynamicVariables[varName]
						: "";
				output += value;
				continue;
			}
		}
	}

	// Reste du texte après la dernière correspondance
	const rest = message.slice(index);
	output += rest;
	return output;
}
