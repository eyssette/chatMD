import { yaml } from "../../../markdown/custom/yaml.mjs";
import { processKroki } from "./plugins/processKroki.mjs";

export function processPlugins(message) {
	// Gestion de schémas et images créés avec mermaid, tikz, graphviz, plantuml …  grâce à Kroki (il faut l'inclure en plugin si on veut l'utiliser)
	if (yaml && yaml.plugins && yaml.plugins.includes("kroki")) {
		message = processKroki(message);
	}
	return message;
}
