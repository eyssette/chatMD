const startLLMsyntax = "`!useLLM`";
const startLLMsyntaxLenght = startLLMsyntax.length;
const endLLMsyntax = "`END !useLLM`";
const endLLMsyntaxLenght = endLLMsyntax.length;

export function splitMarkdownAndLLMPrompts(message) {
	// Pour distinguer dans un message les parties qui correspondent à du contenu en Markdown et les parties qui correspondent à des prompts pour un LLM
	let parts = [];
	let currentIndex = 0;

	while (true) {
		// Cherche le prochain bloc `!useLLM`
		let startLLM = message.indexOf(startLLMsyntax, currentIndex);
		if (startLLM === -1) {
			// S'il n'y a plus de !useLLM, on ajoute ce qui reste du message
			parts.push(message.slice(currentIndex).trim());
			break;
		}

		// Ajoute le message avant !useLLM
		parts.push(message.slice(currentIndex, startLLM).trim());

		// Cherche la fin du bloc END !useLLM
		let endLLM = message.indexOf(endLLMsyntax, startLLM);
		if (endLLM === -1) {
			// S'il n'y a pas de END !useLLM correspondant, on prend le reste du message
			parts.push(message.slice(startLLM + startLLMsyntaxLenght).trim());
			break;
		}

		// Ajoute le bloc entre `!useLLM` et `END !useLLM`
		parts.push(message.slice(startLLM + startLLMsyntaxLenght, endLLM).trim());

		// Mise à jour de l'index pour continuer à chercher après END !useLLM
		currentIndex = endLLM + endLLMsyntaxLenght;
	}

	// S'assure qu'on a bien un élément vide après la dernière occurrence si nécessaire
	if (currentIndex === message.length) {
		parts.push("");
	}

	// Si on n'a pas utilisé de prompt à l'intérieur du markdown, on renvoie le markdown directement
	return parts.length == 1 ? parts[0] : parts;
}
