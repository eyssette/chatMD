// Gestion de schémas et images créés avec mermaid, tikz, graphviz, plantuml …  grâce à Kroki (il faut l'inclure en plugin si on veut l'utiliser)

export function processKroki(message) {
	message = message.replaceAll(
		/```(mermaid|tikz|graphviz|plantuml|excalidraw|vegalite|vega)((.|\n)*?)```/gm,
		function (match, type, source) {
			source = source.replaceAll("\n\n\n", "\n\n");
			return window.krokiCreateImageFromSource(type, source);
		},
	);
	return message;
}
