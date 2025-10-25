import Showdown from "../lib/showdown.js";

// Extensions pour Showdown

function fixSpoilerAdmonitionCodi(text) {
	// Dans CodiMD on peut définir le type de l'admonition spoiler en la mettant avant dans un autre admonition
	const spoilerInAdmonitionRegex =
		/<div class="admonition \w*?"><div class="admonitionTitle"><\/div><div class="admonitionContent">\n(<div class="admonition spoiler">`.*?`<\/div>\n<\/div>)<\/div>/s;
	const spoilerMatch = text.match(spoilerInAdmonitionRegex);
	if (spoilerMatch) {
		text = text.replace(spoilerMatch[0], spoilerMatch[1]);
	}
	return text;
}

// Fonction pour remplacer les admonitions en Markdown par leur équivalent en HTML
function processAdmonition(text, level) {
	const colons = ":".repeat(level);
	// Regex pour capturer les admonitions
	const admonitionRegex = new RegExp(`${colons}(.+?)\n${colons}(\n|$)`, "gms");
	const admonitions = text.match(admonitionRegex);

	if (admonitions) {
		let lastAdmonitionPosition = 0;
		admonitions.forEach((admonition) => {
			// On enregistre la position de l'admonition dans le texte pour pouvoir plus tard vérifier si l'admonition est dans un bloc code
			const admonitionPosition = text.indexOf(admonition[0]);
			// On récupère les informations de l'admonition qui sont dans la première ligne
			// On récupère le type de l'admonition, l'effet collapsible s'il est utilisé, et le titre de l'admonition s'il est utilisé
			const getAdmonitionInfosRegex = /:::(\w+)( collapsible)?( .*)?/;
			const admonitionFirstLine = admonition.slice(0, admonition.indexOf("\n"));
			const admonitionInfos = admonitionFirstLine.match(
				getAdmonitionInfosRegex,
			);
			if (admonitionInfos) {
				// Récupération du type de l'admonition
				const typeAdmonition = admonitionInfos[1] ? admonitionInfos[1] : "";
				// Récupération de l'effet collapsible (optionnel)
				const isCollapsible =
					admonitionInfos[2] || typeAdmonition == "spoiler" ? true : false;
				// Récupération du titre (optionnel)
				const titleAdmonition = admonitionInfos[3]
					? admonitionInfos[3]
					: isCollapsible
						? "Détails"
						: "";
				// Vérifie si l'admonition est dans un bloc code en regardant autour
				const before = text.substring(
					lastAdmonitionPosition,
					admonitionPosition,
				);
				lastAdmonitionPosition = admonitionPosition;
				const isInCode = /<code>|<pre>/.test(
					before.slice(before.lastIndexOf("<")),
				);
				// Si l'admonition est dans un bloc de code, on ne fait rien
				if (isInCode) {
					return;
				}
				// On construit le HTML de l'admonition
				let admonitionHTML = "";
				let contentAdmonition = admonition
					.replace(admonitionFirstLine, "")
					.trim();
				// On supprime dans le contenu la dernière ligne, qui correspond à la fermeture en Markdown de l'admonition
				contentAdmonition = contentAdmonition.substring(
					0,
					contentAdmonition.lastIndexOf("\n"),
				);
				if (isCollapsible) {
					// On affiche d'un coup, sans effet typewriter, le contenu interne de l'admonition si elle est collapsible
					admonitionHTML = `<div class="admonition ${typeAdmonition}">\`<details><summary class="admonitionTitle">${titleAdmonition}</summary><div class="admonitionContent">\n${contentAdmonition}\n</div></details>\`</div>\n`;
				} else {
					admonitionHTML = `<div class="admonition ${typeAdmonition}"><div class="admonitionTitle">${titleAdmonition}</div><div class="admonitionContent">\n${contentAdmonition}\n</div></div>\n`;
				}
				text = text.replace(admonition, admonitionHTML);
			}
		});
	}
	// On applique le fix pour l'utilisation de spoiler avec CodiMD
	text = fixSpoilerAdmonitionCodi(text);
	return text;
}

// Gestion des admonitions (encadrés)
function showdownExtensionAdmonitions() {
	return [
		{
			type: "output",
			filter: (text) => {
				// Fix pour les admonitions qui finissent par une balise particulière
				text = text.replace(/:::(<\/li>)/g, "$1\n:::");
				// Supprimer les balises <p> ou les balises <br /> autour ou à la fin des admonitions
				text = text.replace(/(<p>)?(:::.*?)(<\/p>|<br \/>)/g, "$2");
				let level = 3;
				text = processAdmonition(text, level);
				while (text.includes(":".repeat(level + 1))) {
					level = level + 1;
					text = processAdmonition(text, level);
				}
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
			regex: /\[([^\]]+)\]\(#([^)]+)\)/g, // Reconnaît les liens internes avec #
			replace: function (_, text, anchor) {
				return `<a href="#${anchor}">${text}</a>`;
			},
		},
	];
}

// Gestion du markdown dans les réponses du chatbot
const converter = new Showdown.Converter({
	tasklists: true,
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
	// Fix pour supprimer l'indentation avant les balises HTML afin d'éviter la transformation automatique en bloc code
	text = text.replace(/^[ \t]+(?=<[a-z])/gm, "");
	const html = converter.makeHtml(text).replaceAll("&amp;#96", "`&#96`");
	return html;
}
