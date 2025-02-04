import Showdown from "../externals/showdown.js";

// Extensions pour Showdown

// Extension Showdown pour gérer les admonitions (boîtes d'avertissement/info/note)
function showdownExtensionAdmonitions() {
	return [
		{
			type: "output",
			filter: (text) => {
				// Nettoyer les balises <p> autour des admonitions
				text = text.replace(/<p>(:{3,4}.*?)<\/p>/g, "$1");

				// Fonction récursive pour traiter les admonitions imbriquées
				function processAdmonitions(text, level = 3) {
					const colons = ":".repeat(level);
					// Regex pour capturer les admonitions
					const admonitionRegex = new RegExp(
						`${colons}(\\w+)(?:\\s+(collapsible))?(?:\\s+([^\\n]+)\\n)?([\\s\\S]*?)(\n)${colons}(\n|$)`,
						"g",
					);

					return text.replace(
						admonitionRegex,
						(match, type, collapsible, title = "", content, offset) => {
							const admonitionFirstLine = match.slice(0, match.indexOf("\n"));
							const hasTitle = admonitionFirstLine.trim().indexOf(" ") !== -1;

							// Si l'admonition n'a pas de titre, la variable title fait en fait partie du contenu interne de l'admonition
							if (!hasTitle) {
								content = title + content;
								title = "";
							}

							// Nettoyer le titre des sauts de ligne HTML
							title = title.replace("<br />", "");

							// Vérifier si l'admonition est à l'intérieur d'un bloc de code
							const before = text.substring(0, offset);
							const isInCode = /<code>|<pre>/.test(
								before.slice(before.lastIndexOf("<")),
							);

							if (isInCode) {
								return match;
							}
							const isCollapsible =
								collapsible || admonitionFirstLine.indexOf("spoiler") !== -1;
							// Nettoyer "collapsible" du titre si présent
							if (isCollapsible) {
								title = title
									? title.replace("collapsible", "").trim()
									: "Détails";
							}

							// Traiter récursivement le contenu pour les admonitions imbriquées
							content = processAdmonitions(content, level + 1);

							// Générer le HTML selon que l'admonition soit repliable ou non
							if (isCollapsible) {
								// Si l'admonition est repliable, on désactive l'effet typewriter en encadrant le contenu de details avec : \`
								return `<div class="admonition ${type}">
									\`<details>
										 <summary class="admonitionTitle">${title}</summary>
										 <div class="admonitionContent">${content.trim()}</div>
									</details>\`
							  </div>`;
							} else {
								return `<div class="admonition ${type}">
									<div class="admonitionTitle">${title}</div>
									<div class="admonitionContent">${content.trim()}</div>
							  </div>`;
							}
						},
					);
				}

				// Démarrer le traitement avec le niveau de base (3 ":")
				return processAdmonitions(text);
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
