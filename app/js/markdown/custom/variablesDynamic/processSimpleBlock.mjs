import { getRandomElement } from "../../../utils/arrays.mjs";
import { evaluateExpression } from "./evaluateExpression.mjs";

function processComplexDynamicVariables(complexExpression, dynamicVariables) {
	// Remplace "@variableName" par la variable correspondante, en la convertissant en nombre si c'est possible
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

			if (varName.startsWith("SELECTOR")) {
				// Cas des variables SELECTOR de type `@SELECTOR["cssSelector"]`
				const selectorMatch = varName.match(/SELECTOR\["([^"]+)"\]/);
				if (selectorMatch) {
					const cssSelector = selectorMatch[1];
					const chatContentElement = document.querySelector("#chat");
					// On applique d'abord le sélecteur CSS au contenu déjà affiché dans le chat
					const selectorAppliedToPreviousDisplayedContent =
						chatContentElement.querySelector(cssSelector);
					const value = selectorAppliedToPreviousDisplayedContent
						? selectorAppliedToPreviousDisplayedContent.textContent.trim()
						: "";
					// Si on a trouvé une valeur, on l'utilise directement
					if (value !== "") {
						output += value;
						continue;
					}
					// Sinon, on utilise un élément HTML temporaire pour afficher le message pas encore affiché, et on applique le sélecteur à cet élément,
					const tempElement = document.createElement("div");
					tempElement.innerHTML = output;
					const selectorAppliedToTempElement =
						tempElement.querySelector(cssSelector);
					if (selectorAppliedToTempElement) {
						let foundText = selectorAppliedToTempElement.textContent.trim();
						if (foundText !== "") {
							// Si le texte trouvé est un bloc spécial (readcsv ou !useLLM), on laisse la variable telle quelle pour qu'elle soit traitée plus tard
							const isSpecialBlock =
								foundText.includes("readcsv") || foundText.includes("!useLLM");
							if (isSpecialBlock) {
								foundText = `\`@${varName}\``;
							}
						}
						output += foundText;
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
				const value = dynamicVariables[varName]
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
