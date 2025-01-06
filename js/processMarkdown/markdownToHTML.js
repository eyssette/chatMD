import Showdown from "../externals/showdown.js";

// Extensions pour Showdown

// Gestion des admonitions
function showdownExtensionAdmonitions() {
	return [
		{
			type: "output",
			filter: (text) => {
				// Supprimer les balises <p> autour des admonitions
				text = text.replace(/<p>:::(.*?)<\/p>/g, ":::$1");

				// Expression régulière pour capturer le contenu des admonitions
				const regex = /:::(\w+)(?:\s+(collapsible)?)?\s*(.*?)\n([\s\S]*?):::/g;

				// Traiter chaque match de l'admonition
				text = text.replace(
					regex,
					(match, type, collapsible, title, content, offset) => {
						title = title.replace("<br />", "");
						// Vérifier si l'admonition est dans un bloc code en regardant autour
						const before = text.substring(0, offset);
						const isInCode = /<code>|<pre>/.test(
							before.slice(before.lastIndexOf("<")),
						);

						if (isInCode) {
							// Si l'admonition est dans un bloc de code, on ne fait rien
							return match;
						}

						// Retirer "collapsible" du titre si présent
						if (collapsible) title = title.replace("collapsible", "").trim();

						// Construire le HTML de l'admonition
						if (collapsible) {
							return `<div class="admonition ${type}">
							<details>
								<summary class="admonitionTitle">${title}</summary>
								<div class="admonitionContent">${content.trim()}</div>
							</details>
						</div>`;
						} else {
							return `<div class="admonition ${type}">
							<div class="admonitionTitle">${title}</div>
							<div class="admonitionContent">${content.trim()}</div>
						</div>`;
						}
					},
				);

				return text;
			},
		},
	];
}

// Gestion des attributs génériques du type {.classe1 .classe2}
function showdownExtensionGenericAttributes() {
	return [
		{
			type: "output",
			filter: (text) => {
				const regex = /<(\w+)>(.*?){\.(.*?)}/g;
				const matches = text.match(regex);
				if (matches) {
					let modifiedText = text;
					for (const match of matches) {
						const indexMatch = text.indexOf(match);
						const endIndeMatch = indexMatch + match.length;
						const isInCode =
							text.substring(endIndeMatch, endIndeMatch + 7) == "</code>"
								? true
								: false;
						if (!isInCode) {
							const matchInformations = regex.exec(match);
							const classes = matchInformations[3].replaceAll(".", "");
							const matchReplaced = match.replace(
								regex,
								`<$1 class="${classes}">$2`,
							);
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

// Extension Showdown pour autoriser les liens internes avec espaces
function allowInternalLinksWithSpaces() {
	return [
		{
			type: "output",
			regex: /\[([^\]]+)\]\(\#([^\)]+)\)/g, // Reconnaît les liens internes avec #
			replace: function (_, text, anchor) {
				return `<a href="#${anchor}">${text}</a>`;
			},
		},
	];
}

// Gestion du markdown dans les réponses du chatbot
const converter = new Showdown.Converter({
	emoji: true,
	parseImgDimensions: true,
	simpleLineBreaks: true,
	simplifiedAutoLink: true,
	tables: true,
	openLinksInNewWindow: true,
	extensions: [
		showdownExtensionAdmonitions,
		showdownExtensionGenericAttributes,
		allowInternalLinksWithSpaces,
	],
});

function fixImageDimensionsCodiMD(md) {
	md = md.replaceAll(/=x([0-9]*)\)/g, "=*x$1)");
	md = md.replaceAll(/=([0-9]*)x\)/g, "=$1x*)");
	return md;
}

// Conversion du Markdown en HTML
export function markdownToHTML(text) {
	// Fix pour les tableaux
	text = text.replaceAll("\n|", "|");
	// gestion des dimensions des images avec la syntaxe CodiMD
	text = fixImageDimensionsCodiMD(text);
	// eslint-disable-next-line no-useless-escape
	const html = converter.makeHtml(text).replaceAll("&amp;#96", "`&#96`");
	return html;
}
