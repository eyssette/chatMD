import Showdown from "../externals/showdown.js";

// Extensions pour Showdown

// Gestion des admonitions
function showdownExtensionAdmonitions() {
	return [
		{
			type: "output",
			filter: (text) => {
				text = text.replaceAll(/<p>:::(.*?)<\/p>/g, ":::$1");
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
							let matchReplaced;
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
	],
});

// Conversion du Markdown en HTML
export function markdownToHTML(text) {
	text = text.replaceAll("\n\n|", "|");
	// eslint-disable-next-line no-useless-escape
	const html = converter.makeHtml(text).replaceAll("&amp;#96", "`&#96`");
	return html;
}
