export function validateMarkdown(md) {
	if (!md.includes("# ")) {
		return "# Erreur\nL'URL indiquée ne renvoie pas à un fichier en Markdown avec une syntaxe correcte";
	}
	return md;
}
