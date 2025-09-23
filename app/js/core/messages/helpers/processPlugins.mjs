import { yaml } from "../../../markdown/custom/yaml.mjs";
import { processKroki } from "./plugins/processKroki.mjs";
import { processCsv } from "./plugins/readCsv.mjs";

export async function processPlugins(message) {
	// Gestion de schémas et images créés avec mermaid, tikz, graphviz, plantuml …  grâce à Kroki (il faut l'inclure en plugin si on veut l'utiliser)
	if (yaml && yaml.plugins && yaml.plugins.includes("kroki")) {
		message = processKroki(message);
	}
	if (yaml && yaml.plugins && yaml.plugins.includes("readcsv")) {
		message = await new Promise((resolve) => {
			const interval = setInterval(async () => {
				if (window.Papa) {
					clearInterval(interval);
					const result = await processCsv(message);
					resolve(result);
				}
			}, 500);
		});
	}
	return message;
}
