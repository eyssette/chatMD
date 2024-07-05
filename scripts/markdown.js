// Gestion des variables fixes : soit avant de parser le markdown, soit après
function processFixedVariables(content, preprocess = false) {
	// Les variables fixes qui commencent par _ sont traitées avant de parser le contenu du Markdown
	const regex = preprocess ? /@{(_\S+)}/g : /@{(\S+)}/g;
	return content.replaceAll(
		regex,
		function (match, variableName, positionMatch) {
			const positionLastMatch = content.lastIndexOf(match);
			if (yamlData && yamlData.variables && yamlData.variables[variableName]) {
				const variableValue = yamlData.variables[variableName];
				const variableValueSplit = variableValue.split("///");
				const variableValueChoice = getRandomElement(variableValueSplit);
				if (preprocess && positionMatch == positionLastMatch) {
					// Les variables fixes qui ont été traitées au tout début, avant de parser le contenu du Markdown, sont ensuite supprimés.
					delete yamlData.variables[variableName];
				}
				return variableValueChoice;
			} else {
				return "@{" + variableName + "}";
			}
		}
	);
}

// Extensions pour Showdown

// Gestion des admonitions
function showdownExtensionAdmonitions() {
	return [
		{
			type: "output",
			filter: (text) => {
				text = text.replaceAll("<p>:::", ":::");
				const regex = /:::(.*?)\n(.*?):::/gs;
				const matches = text.match(regex);
				if (matches) {
					let modifiedText = text;
					for (const match of matches) {
						const regex2 = /:::(.*?)\s(.*?)\n(.*?):::/s;
						const matchInformations = regex2.exec(match);
						const indexMatch = text.indexOf(match);
						// Pas de transformation de l'admonition en html si l'admonition est dans un bloc code
						const isInCode =
							text.substring(indexMatch - 6, indexMatch) == "<code>"
								? true
								: false;
						if (!isInCode) {
							let type = matchInformations[1];
							let title = matchInformations[2];
							if (type.includes("<br")) {
								type = type.replace("<br", "");
								title = "";
							}
							const content = matchInformations[3];
							if (title.includes("collapsible")) {
								title = title.replace("collapsible", "");
								matchReplaced = `<div><div class="admonition ${type}"><details><summary class="admonitionTitle">${title}</summary><div class="admonitionContent">${content}</div></details></div></div>`;
							} else {
								matchReplaced = `<div><div class="admonition ${type}"><div class="admonitionTitle">${title}</div><div class="admonitionContent">${content}</div></div></div>`;
							}
							modifiedText = modifiedText.replaceAll(match, matchReplaced);
						}
					}
					return modifiedText;
				} else {
					return text;
				}
			},
		},
	];
}

// Gestion du markdown dans les réponses du chatbot
const converter = new showdown.Converter({
	emoji: true,
	parseImgDimensions: true,
	simpleLineBreaks: true,
	simplifiedAutoLink: true,
	tables: true,
	openLinksInNewWindow: true,
	extensions: [showdownExtensionAdmonitions],
});

// Conversion du Markdown en HTML
function markdownToHTML(text) {
	text = text.replaceAll("\n\n|", "|");
	const html = converter.makeHtml(text);
	return html;
}

function convertLatexExpressions(string) {
	string = string
		.replace(/\$\$(.*?)\$\$/g, "&#92;[$1&#92;]")
		.replace(/\$(.*?)\$/g, "&#92;($1&#92;)");
	let expressionsLatex = string.match(
		new RegExp(/&#92;\[.*?&#92;\]|&#92;\(.*?&#92;\)/g)
	);
	if (expressionsLatex) {
		// On n'utilise Katex que s'il y a des expressions en Latex dans le Markdown
		for (let expressionLatex of expressionsLatex) {
			// On vérifie le mode d'affichage de l'expression (inline ou block)
			const inlineMaths = expressionLatex.includes("&#92;[") ? true : false;
			// On récupère la formule mathématique
			let mathInExpressionLatex = expressionLatex
				.replace("&#92;[", "")
				.replace("&#92;]", "");
			mathInExpressionLatex = mathInExpressionLatex
				.replace("&#92;(", "")
				.replace("&#92;)", "");
			mathInExpressionLatex = mathInExpressionLatex
				.replaceAll("&lt;", "\\lt")
				.replaceAll("&gt;", "\\gt");
			mathInExpressionLatex = mathInExpressionLatex
				.replaceAll("<em>","_")
				.replaceAll("</em>","_")
				.replaceAll("&amp;","&")
				.replaceAll("\ ","\\ ");
			// On convertit la formule mathématique en HTML avec Katex
			stringWithLatex = katex.renderToString(mathInExpressionLatex, {
				displayMode: inlineMaths,
			});
			string = string.replace(expressionLatex, stringWithLatex);
		}
	}
	// Optimisation pour le Latex avec l'effet typeWriter
	if(yamlTypeWriter === true) {
		string = string.replaceAll(
			/(<span class="katex-mathml">(.|\n)*?<\/span>)/gm,
			"`$1`"
		);
		string = string.replaceAll(/(<span class=".?strut">.*?<\/span>)/g, "`$1`");
	}
	return string;
}