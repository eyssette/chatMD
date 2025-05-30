import { yaml } from "./custom/yaml.mjs";

export function convertLatexExpressions(string, noBackticks) {
	string = string
		.replace(/\$\$(.*?)\$\$/g, "&#92;[$1&#92;]")
		.replace(/\$(.*?)\$/g, "&#92;($1&#92;)");
	let expressionsLatex = string.match(
		new RegExp(/&#92;\[.*?&#92;\]|&#92;\(.*?&#92;\)/g),
	);
	if (expressionsLatex) {
		// On n'utilise Katex que s'il y a des expressions en Latex dans le Markdown
		for (let expressionLatex of expressionsLatex) {
			// On vérifie le mode d'affichage de l'expression (inline ou block)
			const inlineMaths = expressionLatex.includes("&#92;[") ? true : false;
			// On récupère la formule mathématique
			let mathInExpressionLatex = expressionLatex
				.replace("&#92;[", "")
				.replace("&#92;]", "")
				.replace("&#92;(", "")
				.replace("&#92;)", "")
				.replaceAll("&lt;", "\\lt")
				.replaceAll("&gt;", "\\gt")
				.replaceAll("align<em>", "align*")
				.replaceAll("align</em>", "align*")
				.replaceAll("<em>", "_")
				.replaceAll("</em>", "_")
				.replaceAll("&amp;", "&")
				.replaceAll("\\left{", "\\left\\{")
				.replaceAll("\\right}", "\\right\\}")
				.replaceAll(" ", "\\ ")
				// Fix pour l'utilisation de \\ dans le Latex
				.replaceAll("&#92;&#92;", "\\\\");
			// On convertit la formule mathématique en HTML avec Katex
			if (window.katex) {
				const stringWithLatex = window.katex.renderToString(
					mathInExpressionLatex,
					{
						displayMode: inlineMaths,
					},
				);
				string = string.replace(expressionLatex, stringWithLatex);
			}
		}
	}
	// Optimisation pour le Latex avec l'effet typeWriter
	// On peut empêcher l'utilisation des backticks en mettant noBackticks à "true"
	if (yaml && yaml.typeWriter === true && !noBackticks) {
		string = string.replaceAll(
			/(<span class="katex-mathml">(.|\n)*?<\/span>)/gm,
			"`$1`",
		);
		string = string.replaceAll(/(<span class=".?strut">.*?<\/span>)/g, "`$1`");
	}
	return string;
}
