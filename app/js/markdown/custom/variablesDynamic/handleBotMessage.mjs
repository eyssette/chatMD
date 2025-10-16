import { extractStructureFromMessage } from "./extractStructureFromMessage.mjs";
import { processBlocks } from "./processBlocks.mjs";

export function handleBotMessage(message, dynamicVariables, getLastMessage) {
	// On masque dans le texte les demandes de définition d'une variable par le prochain Input
	message = message.replaceAll(
		/`@([^\s]*?) ?= ?@INPUT : (.*)`/g,
		function (match, variableName, nextAnswer) {
			getLastMessage = match ? [variableName, nextAnswer] : false;
			return "";
		},
	);

	// On extrait la structure du message, avec éventuellement des blocs conditionnels, qui peuvent être imbriqués
	const structureMessage = extractStructureFromMessage(message);
	let output = "";
	structureMessage.forEach((block) => {
		// On fait le traitement des variables dynamiques de manière séquentielle dans chaque bloc de contenu
		output += processBlocks(block, dynamicVariables);
	});
	message = output;

	// Au lieu de récupérer l'input, on peut récupérer le contenu d'un bouton qui a été cliqué et on assigne alors ce contenu à une variable : pour cela on intègre la variable dans le bouton, et on la masque avec la classe "hidden"
	message = message.replaceAll(
		/ (@[^\s]*?=.*?)</g,
		'<span class="hidden">$1</span><',
	);
	message = message.replaceAll(
		/>(@[^\s]*?=)/g,
		'><span class="hidden">$1</span>',
	);

	// On nettoie le message en supprimant les lignes vides en trop
	message = message.replaceAll(/\n\n\n*/g, "\n\n");
	return [message, getLastMessage];
}
