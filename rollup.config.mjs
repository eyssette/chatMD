import terser from "@rollup/plugin-terser";
import { string } from "rollup-plugin-string";
import fs from "fs";
import path from "path";
import postcss from "rollup-plugin-postcss";
import cssnano from "cssnano";

const ECMA_VERSION = 2018;
const appFolder = "app/";
const folderWithMarkdownFilesToCombine = appFolder + "data/";
const mainMdFileName = "index.md";
const warningAutomaticallyGeneratedFile =
	"\n<!--Fichier généré automatiquement à partir des fichiers présents dans le dossier data/.\nAttention : les modifications faites manuellement dans ce fichier seront écrasées à la prochaine compilation de ChatMD -->\n";

// Pour récupérer tous les fichiers en Markdown dans un dossier, de manière récusrive
function getAllMdFiles(dir) {
	const files = fs.readdirSync(dir, { withFileTypes: true });
	let mdFiles = [];
	for (const file of files) {
		const res = path.resolve(dir, file.name);
		if (file.isDirectory()) {
			mdFiles = mdFiles.concat(getAllMdFiles(res));
		} else if (file.name.endsWith(".md")) {
			mdFiles.push(res);
		}
	}
	return mdFiles;
}

// Pour concaténer le contenu d'un ensemble de fichiers
function combineFilesContent(files) {
	const filesContent = files.map((file) => fs.readFileSync(file, "utf8"));
	return [...filesContent].join("\n");
}

// Pour ajouter un message après l'en-tête YAML, s'il y en a un, dans un contenu en Markdown
function addMessageAfterYAML(initialMarkdown, message) {
	let content = initialMarkdown.trim();
	const yaml =
		content.startsWith("---") && content.split("---").length > 2
			? "---" + content.split("---")[1] + "---\n"
			: "";

	if (yaml) {
		const contentWithoutYaml = content.replace(yaml, "");
		content = yaml + message + contentWithoutYaml;
	} else {
		content = message + content;
	}
	return content;
}

// On regarde s'il existe un dossier de fichiers Markdown à concaténer pour créer le fichier index.md
if (fs.existsSync(folderWithMarkdownFilesToCombine)) {
	// Si ce dossier existe …
	const mainMdFile = folderWithMarkdownFilesToCombine + mainMdFileName;
	let mainMdContent = fs.readFileSync(mainMdFile, "utf8");
	// … on fait la concaténation des fichiers Markdown dans ce dossier
	const mdFiles = getAllMdFiles(appFolder + "data").filter(
		(file) => !file.endsWith(mainMdFile),
	);
	if (mdFiles) {
		// … puis on crée le fichier index.md à partir de ces fichiers
		const combinedContent = combineFilesContent(mdFiles);
		mainMdContent = [mainMdContent, ...combinedContent].join("\n");
		// On ajoute un message d'avertissement dans le fichier, juste après l'en-tête YAML
		// afin de préciser que le contenu de ce fichier a été généré automatiquement
		// à partir d'un dossier de fichiers en Markdown
		mainMdContent = addMessageAfterYAML(
			mainMdContent,
			warningAutomaticallyGeneratedFile,
		);
		fs.writeFileSync(appFolder + "index.md", mainMdContent);
	}
} else {
	// Si le dossier n'existe pas, on utilise le fichier index.md pour définir le contenu principal, mais ce fichier n'existe pas, on crée un fichier index.md avec un contenu par défaut
	if (!fs.existsSync(mainMdFileName)) {
		const defaultContent =
			"# Chatbot\nAucun chatbot par défaut n'a été configuré.\nIl faut créer un fichier index.md dans votre dépôt pour définir le chatbot par défaut.";
		fs.writeFileSync(appFolder + "index.md", defaultContent);
	}
}

// On supprime certains messages d'erreurs qu'affiche Rollup et qui ne sont pas très utiles
const onwarn = (warning) => {
	if (
		warning.code === "CIRCULAR_DEPENDENCY" ||
		warning.code === "THIS_IS_UNDEFINED"
	) {
		return;
	}
	console.warn(`(!) ${warning.message}`);
};

// En mode DEBUG, on ne change pas le nom des variables, afin de pouvoir les vérifier
const optionsTerser =
	process.env.DEBUG == "true"
		? { mangle: false, ecma: ECMA_VERSION }
		: { ecma: ECMA_VERSION };

// Configuration de la compilation avec Rollup
export default {
	input: appFolder + "js/main.mjs",
	onwarn,
	output: {
		file: appFolder + "script.min.js",
		format: "iife",
		plugins: [terser(optionsTerser)],
		sourcemap: true,
	},
	plugins: [
		string({
			include: appFolder + "*.md",
		}),
		postcss({
			extensions: [".css"],
			extract: "css/styles.min.css",
			minimize: true,
			plugins: [
				cssnano({
					preset: "default",
				}),
			],
		}),
	],
};
