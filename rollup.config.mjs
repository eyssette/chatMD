import terser from "@rollup/plugin-terser";
import { string } from "rollup-plugin-string";
import fs from "fs";
import path from "path";
import postcss from "rollup-plugin-postcss";
import cssnano from "cssnano";

const mainMdPath = "data/main.md";
const mainMdContent = fs.readFileSync(mainMdPath, "utf8");
const otherMdFiles = getAllMdFiles("data").filter(
	(file) => !file.endsWith(mainMdPath),
);

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

function createCombinedMdFile() {
	const filesContent = otherMdFiles.map((file) =>
		fs.readFileSync(file, "utf8"),
	);
	const combinedContent = [mainMdContent, ...filesContent].join("\n");
	fs.writeFileSync("data.md", combinedContent);
}

createCombinedMdFile();

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
		{
			name: "concat-md-files",
			concatMDfiles() {
				const filesContent = otherMdFiles.map((file) =>
					fs.readFileSync(file, "utf8"),
				);
				const combinedContent = [mainMdContent, ...filesContent].join("\n");
				this.emitFile({
					type: "asset",
					fileName: "data.md",
					source: combinedContent,
				});
			},
		},
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
