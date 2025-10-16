// Permet d'extraire la structure d'un message, avec les blocs conditionnels, éventuellement imbriqués
export function extractStructureFromMessage(text) {
	// Regex pour détecter les balises if et endif
	const ifRegex = /`if\s+(.*?)`/g;
	const endifRegex = /`endif`/g;

	// Tableau pour stocker toutes les balises avec leurs positions
	const tokens = [];
	let match;

	// Chercher tous les `if`
	// On enregistre la position et la condition associée à ce `if`
	while ((match = ifRegex.exec(text)) !== null) {
		tokens.push({
			type: "if",
			position: match.index,
			length: match[0].length,
			condition: match[1],
		});
	}

	// Chercher tous les `endif`
	while ((match = endifRegex.exec(text)) !== null) {
		tokens.push({
			type: "endif",
			position: match.index,
			length: match[0].length,
		});
	}

	// Trier les balises par ordre d'apparition dans le texte
	tokens.sort((a, b) => a.position - b.position);

	let currentIndex = 0;

	// Fonction récursive pour construire la structure imbriquée
	function parseLevel(startPos, endPos) {
		const result = [];
		let i = startPos;

		while (i < endPos) {
			const token = tokens[i];

			if (!token || token.position >= text.length) break;

			// Ajouter le texte avant la balise actuelle
			const textBefore = text.substring(currentIndex, token.position);

			if (textBefore) {
				result.push({ content: textBefore });
			}

			if (token.type === "if") {
				// Trouver le endif correspondant
				let depth = 1;
				let endifIndex = i + 1;

				while (endifIndex < tokens.length && depth > 0) {
					if (tokens[endifIndex].type === "if") depth++;
					if (tokens[endifIndex].type === "endif") depth--;
					if (depth === 0) break;
					endifIndex++;
				}

				// Déplacer currentIndex après l'expression de la condition `if`
				currentIndex = token.position + token.length;

				// Parser récursivement le contenu entre if et endif
				const nestedContent = parseLevel(i + 1, endifIndex);
				result.push({ condition: token.condition, content: nestedContent });

				// Déplacer currentIndex après le `endif`
				if (endifIndex < tokens.length) {
					currentIndex =
						tokens[endifIndex].position + tokens[endifIndex].length;
				}

				i = endifIndex + 1;
			} else {
				// C'est un endif, on arrête ce niveau
				break;
			}
		}

		// Ajouter le texte restant à ce niveau
		const remainingText = text.substring(
			currentIndex,
			endPos < tokens.length ? tokens[endPos].position : text.length,
		);

		if (remainingText) {
			result.push({ content: remainingText });
		}

		return result;
	}

	const structure = parseLevel(0, tokens.length);
	return structure;
}
