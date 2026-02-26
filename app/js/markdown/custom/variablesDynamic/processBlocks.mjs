import { processSimpleBlock } from "./processSimpleBlock.mjs";
import { checkConditionalBlock } from "./checkConditionalBlock.mjs";

// Fonction récursive qui traite un bloc de contenu, qui peut contenir des sous-blocs, éventuellement conditionnels
export function processBlocks(
	block,
	dynamicVariables,
	cumulativeOutput,
	useSelectors = false,
) {
	let output = "";

	// On vérifie si le bloc contient des sous-blocs
	const hasSubBlocks = Array.isArray(block.content);
	if (hasSubBlocks) {
		let conditionCheck = null;
		// Si le bloc contient une condition, on la vérifie
		if (block.condition) {
			conditionCheck = checkConditionalBlock(
				block,
				dynamicVariables,
				cumulativeOutput,
			);
		}
		// On détermine si le bloc doit être traité :
		// - soit il n'y a pas de condition
		// - soit la condition est présente et validée par checkConditionalBlock
		const shouldProcessBlock =
			!block.condition || (block.condition && conditionCheck.result);
		if (shouldProcessBlock) {
			const subBlocks = block.content;
			subBlocks.forEach((subBlock) => {
				// Parcourt chaque sous-bloc et traite récursivement

				// Cas où la condition nécessite une évaluation différée
				// Dans ce cas on réintègre le bloc conditionnel dans le message pour un traitement ultérieur
				if (conditionCheck.differEvaluation == true) {
					// On marque les directives !Next qui sont dans des blocs conditionnels à évaluation différée pour qu'elles soient elles aussi traitées plus tard, au moment de l'affichage du message
					if (subBlock.content.includes("!Next:")) {
						subBlock.content = subBlock.content.replaceAll(
							/!Next ?:(.*)/g,
							function (match, nextDirectiveContent) {
								// On ajoute "!differEvaluation" dans les options à la fin de la directive !Next, si ces options existent déjà, ou on les crée si elles n'existent pas
								// Syntaxe : !Next: nom de la prochaine étape / options (ex: ignoreKeywords) !differEvaluation
								if (nextDirectiveContent.includes("/")) {
									return `!Next: ${nextDirectiveContent} !differEvaluation`;
								} else {
									return `!Next: ${nextDirectiveContent} / !differEvaluation`;
								}
							},
						);
					}
					output += `
\`if ${conditionCheck.result}\`
${processBlocks(subBlock, dynamicVariables, cumulativeOutput, useSelectors)}
\`endif\`
					`;
				} else {
					// Traitement normal du sous-bloc
					output += processBlocks(
						subBlock,
						dynamicVariables,
						cumulativeOutput,
						useSelectors,
					);
				}
			});
		}
	} else {
		// Si le bloc n'a pas de sous-blocs, on le traite comme un bloc simple
		output += processSimpleBlock(
			block.content,
			dynamicVariables,
			cumulativeOutput,
			useSelectors,
		);
	}
	return output;
}
