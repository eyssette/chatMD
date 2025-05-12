export function validateMarkdown(md, defaultMd) {
	if (!md.includes("# ")) {
		alert(
			"L'URL indiquée ne renvoie pas à un fichier en Markdown avec une syntaxe correcte",
		);
		md = defaultMd;
	}
	return md;
}
