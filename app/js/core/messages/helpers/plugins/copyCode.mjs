// Ajoute un bouton "copier" pour les blocs code

export function processCopyCode(html) {
	html = html.replaceAll(
		"</pre>",
		'<button class="copyCode">Copier</button></pre>',
	);
	return html;
}
