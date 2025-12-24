import { yaml } from "../../../markdown/custom/yaml.mjs";
import { processKroki } from "./plugins/processKroki.mjs";
import { processCsv } from "./plugins/readCsv.mjs";

export async function processPlugins(message) {
	// Gestion de schémas et images créés avec mermaid, tikz, graphviz, plantuml …  grâce à Kroki (il faut l'inclure en plugin si on veut l'utiliser)
	if (yaml && yaml.plugins && yaml.plugins.includes("kroki")) {
		message = processKroki(message);
	}
	// Gestion du plugin readcsv pour intégrer des données CSV dans les messages
	if (yaml && yaml.plugins && yaml.plugins.includes("readcsv")) {
		message = await new Promise((resolve) => {
			// Délai autorisé de traitement du csv (en millisecondes)
			const TIMEOUT_MS = 5000;
			const start = Date.now();
			// On vérifie que la librairie pour lire les CSV est bien chargée
			const interval = setInterval(async () => {
				// Si le processus prend trop de temps, on arrête et on renvoie le message initial, non modifié
				if (Date.now() - start > TIMEOUT_MS) {
					clearInterval(interval);
					resolve(message);
				}
				// Si la librairie pour lire les CSV est bien chargée, on procède au traitement des données, sinon on renvoie le message initial non modifiée
				if (window.Papa) {
					try {
						clearInterval(interval);
						const result = await processCsv(message);
						resolve(result);
					} catch (error) {
						if (error) {
							console.log(error);
						}
						resolve(message);
					}
				}
			}, 500);
		});
	}
	return message;
}
