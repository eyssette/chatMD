import { yaml } from "../../yaml.mjs";

const START_PROMPT_TAG = "`!useLLM`";
const END_PROMPT_TAG = "`END !useLLM`";

// Pour distinguer dans un message les parties qui correspondent à du contenu en Markdown et les parties qui correspondent à des prompts pour un LLM
export function extractMarkdownAndPrompts(message) {
	if (!yaml || !yaml.useLLM.url) return { useLLM: false };

	const result = [];
	let currentIndex = 0;

	while (true) {
		// Cherche le prochain bloc de prompt
		const start = message.indexOf(START_PROMPT_TAG, currentIndex);
		// S'il n'y en a pas, on ajoute le reste en tant que contenu Markdown à la fin de la séquence (s'il y a encore du contenu), et on sort de la boucle
		if (start === -1) {
			const remaining = message.slice(currentIndex).trim();
			if (remaining) result.push({ type: "markdown", content: remaining });
			break;
		}

		// S'il y a un message avant le premier prompt, on l'ajoute en tant que contenu Markdown
		const before = message.slice(currentIndex, start).trim();
		if (before) result.push({ type: "markdown", content: before });

		// On cherche la fin du bloc de prompt
		const end = message.indexOf(END_PROMPT_TAG, start);
		if (end === -1) {
			// S'il n'y a pas de fin de bloc explicite, on prend le contenu jusqu'à la fin du message comme contenu du prompt, et on sort de la boucle
			const prompt = message.slice(start + START_PROMPT_TAG.length).trim();
			if (prompt) result.push({ type: "prompt", content: prompt });
			break;
		}

		// On ajoute le bloc de prompt trouvé entre le tag de début et le tag de fin qui marquent la présence d'un prompt
		const prompt = message.slice(start + START_PROMPT_TAG.length, end).trim();
		if (prompt) result.push({ type: "prompt", content: prompt });

		// On met à jour l'index pour continuer à chercher s'il y a encore des blocs de prompts après celui qu'on vient de repérer.
		currentIndex = end + END_PROMPT_TAG.length;
	}

	return {
		useLLM: true,
		sequence: result,
	};
}
