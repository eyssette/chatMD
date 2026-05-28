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

	// Détection de la présence de SELECTOR dans le message pour optimisation
	const useSelectors = message.includes("@SELECTOR[");

	// On extrait la structure du message, avec éventuellement des blocs conditionnels, qui peuvent être imbriqués
	const structureMessage = extractStructureFromMessage(message);
	let output = "";
	structureMessage.forEach((block) => {
		// On fait le traitement des variables dynamiques de manière séquentielle dans chaque bloc de contenu
		output += processBlocks(block, dynamicVariables, output, useSelectors);
	});
	message = output;

	// Au lieu de récupérer l'input, on peut récupérer le contenu d'un bouton qui a été cliqué et on assigne alors ce contenu à une variable : pour cela on intègre la variable dans le bouton, et on la masque avec la classe "hidden"

	// Cas où il n'y a qu'une simple assignation sans autre texte
	// Exemple : 1. [@choix=Choix 1](cible)
	// On affiche dans le bouton "Choix 1", et on garde dans un élément HTML caché l'assignation de valeur qui sera à traiter.
	message = message.replace(
		/<a href="(.*)?">(@[^\s]*?)=(.*?)<\/a>/g,
		'<a href="$1"><span class="hidden">$2=$3</span>$3</a>',
	);

	// On masque l'assignation de la variable dans le bouton
	message = message.replace(
		/ (@[^\s]*?=.*?)<\/a>/g,
		'<span class="hidden">$1</span></a>',
	);

	// On masque aussi, dans le message qui s'est affiché suite au clic sur le bouton, l'assignation de la variable qui a été transmise à ce message
	message = message.replace(
		/class="(.*)?">(@[^\s]*?=)/g,
		(match, beforeVariable, variable) => {
			return beforeVariable.includes("hidden")
				? `class="${beforeVariable}">${variable}`
				: `class="${beforeVariable}"><span class="hidden">${variable}</span>`;
		},
	);

	// On nettoie le message en supprimant les lignes vides en trop
	message = message.replaceAll(/\n\n\n*/g, "\n\n");
	return [message, getLastMessage];
}
