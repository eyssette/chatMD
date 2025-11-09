export function checkDarkModePreference() {
	if (
		window.matchMedia &&
		window.matchMedia("(prefers-color-scheme: dark)").matches
	) {
		document.documentElement.classList.add("darkmode");
	}
}

export function scopeStyles(htmlString, prefix) {
	return htmlString.replace(
		/<style\s+[^>]*scoped[^>]*>([\s\S]*?)<\/style>/gi,
		(match, css) => {
			// Nettoie le CSS et supprime les commentaires
			let cleanCSS = css.replace(/\/\*[\s\S]*?\*\//g, "");

			// Extrait chaque bloc de règle CSS : sélecteur(s) { propriétés }
			const ruleRegex = /([^{}]+)\{([^{}]*)\}/g;

			const scopedCSS = cleanCSS.replace(
				ruleRegex,
				(fullMatch, selectors, properties) => {
					// Traite chaque sélecteur séparé par des virgules
					const scopedSelectors = selectors
						.split(",")
						.map((sel) => sel.trim())
						.filter(Boolean)
						.map((sel) => {
							// Évite de doubler le préfixe
							if (sel.startsWith(prefix)) return sel;

							// Gère les @-rules (media queries, keyframes, etc.)
							if (
								sel.startsWith("@") ||
								sel.startsWith("from") ||
								sel.startsWith("to") ||
								sel.endsWith("%")
							)
								return sel;

							// Ajoute le préfixe
							// Si on a une règle sur le message lui-même, il ne faut pas considérer le sélecteur comme enfant du message, mais comme portant sur le message lui-même
							const sep = sel === ".message" ? "" : " ";
							return `${prefix}${sep}${sel}`;
						})
						.join(", ");

					// Reconstruit la règle complète
					return `${scopedSelectors} { ${properties} }`;
				},
			);
			// On désactive l'effet typewriter pour la balise style avec \`
			return `\\\`\n<style>${scopedCSS}</style>\n\\\``;
		},
	);
}
