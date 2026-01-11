import { extractStructureFromMessage } from "../../../markdown/custom/variablesDynamic/extractStructureFromMessage.mjs";
import { processBlocks } from "../../../markdown/custom/variablesDynamic/processBlocks.mjs";

export function processDynamicVariablesAtDisplayTime(
	message,
	dynamicVariables,
) {
	const structureMessage = extractStructureFromMessage(message);
	let output = "";
	structureMessage.forEach((block) => {
		// On fait le traitement des variables dynamiques de manière séquentielle dans chaque bloc de contenu
		output += processBlocks(block, dynamicVariables, output);
	});
	message = output;
	return message;
}
