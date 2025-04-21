import terser from "@rollup/plugin-terser";
import { string } from "rollup-plugin-string";
import fs from "fs";
import path from "path";
import postcss from "rollup-plugin-postcss";
import cssnano from "cssnano";

const mainMdPath = "data/";

let mainMdContent;
let otherMdFiles;

if (fs.existsSync(mainMdPath)) {
	const mainMdFile = mainMdPath + "index.md";
	mainMdContent = fs.readFileSync(mainMdFile, "utf8");
	otherMdFiles = getAllMdFiles("data").filter(
		(file) => !file.endsWith(mainMdFile),
	);
} else {
	mainMdContent = fs.readFileSync("index.md", "utf8");
}

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

const warningAutomaticallyGeneratedFile =
	"\n<!--Fichier généré automatiquement à partir des fichiers présents dans le dossier data/.\nAttention : les modifications faites manuellement dans ce fichier seront écrasées à la prochaine compilation de ChatMD -->\n";

mainMdContent = mainMdContent.trim();
const yamlInMainMdContent =
	mainMdContent.startsWith("---") && mainMdContent.split("---").length > 2
		? "---" + mainMdContent.split("---")[1] + "---\n"
		: "";

if (yamlInMainMdContent) {
	const mainMdContentWithoutYaml = mainMdContent.replace(
		yamlInMainMdContent,
		"",
	);
	mainMdContent =
		yamlInMainMdContent +
		warningAutomaticallyGeneratedFile +
		mainMdContentWithoutYaml;
} else {
	mainMdContent = warningAutomaticallyGeneratedFile + mainMdContent;
}

function createCombinedMdFile() {
	const filesContent = otherMdFiles.map((file) =>
		fs.readFileSync(file, "utf8"),
	);
	const combinedContent = [mainMdContent, ...filesContent].join("\n");
	fs.writeFileSync("index.md", combinedContent);
}

if (otherMdFiles) {
	createCombinedMdFile();
}

export default {
	input: "js/main.js",
	output: {
		file: "script.min.js",
		format: "iife",
		plugins: [terser()],
		sourcemap: true,
	},
	plugins: [
		string({
			include: "*.md",
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
