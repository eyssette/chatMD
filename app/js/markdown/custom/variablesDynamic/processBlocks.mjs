import { processSimpleBlock } from "./processSimpleBlock.mjs";
import { checkConditionalBlock } from "./checkConditionalBlock.mjs";

// Fonction récursive qui traite un bloc de contenu, qui peut contenir des sous-blocs, éventuellement conditionnels
export function processBlocks(block, dynamicVariables) {
	let output = "";

	// On vérifie si le bloc contient des sous-blocs
	const hasSubBlocks = Array.isArray(block.content);
	if (hasSubBlocks) {
		// On détermine si le bloc doit être traité :
		// - soit il n'y a pas de condition
		// - soit la condition est présente et validée par checkConditionalBlock
		const shouldProcessBlock =
			!block.condition ||
			(block.condition &&
				checkConditionalBlock(block.condition, dynamicVariables));
		if (shouldProcessBlock) {
			const subBlocks = block.content;
			subBlocks.forEach((subBlock) => {
				// Parcourt chaque sous-bloc et traite récursivement
				output += processBlocks(subBlock, dynamicVariables);
			});
		}
	} else {
		// Si le bloc n'a pas de sous-blocs, on le traite comme un bloc simple
		output += processSimpleBlock(block.content, dynamicVariables);
	}
	return output;
}
