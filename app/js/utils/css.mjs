export function scopeStyles(htmlString, prefix) {
	// Trouve toutes les balises <style scoped>...</style>
	return htmlString.replace(
		/<style\s+[^>]*scoped[^>]*>([\s\S]*?)<\/style>/gi,
		(match, css) => {
			// Préfixe chaque sélecteur CSS avec le préfix choisi
			const scopedCSS = css.replace(/(^|})([^@}]+)/g, (full, brace, rules) => {
				const scopedRules = rules
					.split(",")
					.map((sel) => sel.trim())
					.filter(Boolean)
					.map((sel) => {
						// On évite de doubler le préfixe
						if (sel.startsWith(`${prefix}`)) return sel;
						return `${prefix} ${sel}`;
					})
					.join(", ");
				return `${brace} ${scopedRules}`;
			});
			// On désactive l'effet typewriter pour la balise style
			return `\\\`<style>${scopedCSS}</style>\\\``;
		},
	);
}
