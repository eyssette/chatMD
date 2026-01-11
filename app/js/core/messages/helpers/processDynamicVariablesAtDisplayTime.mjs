import { extractStructureFromMessage } from "../../../markdown/custom/variablesDynamic/extractStructureFromMessage.mjs";
import { processBlocks } from "../../../markdown/custom/variablesDynamic/processBlocks.mjs";

export function processDynamicVariablesAtDisplayTime(
	message,
	dynamicVariables,
	sequence,
) {
	// Détection de la présence de SELECTOR dans le message pour optimisation
	// On récupère la séquence complète des contenus pour vérifier la présence de SELECTOR
	const contentSequence = sequence.map((section) => section.content);
	const combinedSequence = contentSequence.join("\n");
	const useSelectors = combinedSequence.includes("@SELECTOR[");

	const structureMessage = extractStructureFromMessage(message);
	let output = "";
	structureMessage.forEach((block) => {
		// On fait le traitement des variables dynamiques de manière séquentielle dans chaque bloc de contenu
		output += processBlocks(block, dynamicVariables, output, useSelectors);
	});
	message = output;
	return message;
}
