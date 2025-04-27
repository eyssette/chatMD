import { config } from "../../config.mjs";
import { handleURL } from "../../utils/urls.mjs";
import { controlChatbot } from "../interactions/controller.mjs";
import { processYAML } from "../../markdown/custom/yaml.mjs";
import { parseMarkdown } from "./parseMarkdown.mjs";

// Pour récupérer le markdown externe via le hash dans l'URL
export function createChatbot(defaultMD) {
	let chatData;
	// On récupère l'URL du hashtag sans le #
	const url = window.location.hash.substring(1).replace(/\?.*/, "");
	// On traite l'URL pour pouvoir récupérer correctement la source du chatbot
	const sourceChatBot = handleURL(url);
	if (sourceChatBot !== "") {
		if (Array.isArray(sourceChatBot)) {
			// Cas où la source est répartie dans plusieurs fichiers
			const promises = sourceChatBot.map((urlToInclude) => {
				const processedUrl = handleURL(urlToInclude);
				return fetch(processedUrl).then((response) => response.text());
			});
			Promise.all(promises)
				.then((data) => {
					const md = data.join("\n");
					const yaml = processYAML(md);
					chatData = parseMarkdown(md, yaml);
					controlChatbot(chatData);
				})
				.catch((error) => console.error(error));
		} else {
			// Récupération du contenu du fichier
			fetch(sourceChatBot)
				.then((response) => response.text())
				.then((data) => {
					let md = data;
					const yaml = processYAML(md);
					if (yaml && yaml.include) {
						let filesToAdd = yaml.include;
						filesToAdd =
							typeof filesToAdd == "object" ? filesToAdd : { filesToAdd };
						const promises = Object.values(filesToAdd).map((url) => {
							const processedUrl = handleURL(url);
							return fetch(processedUrl).then((response) => {
								if (!response.ok) {
									throw new Error(
										`Erreur lors de la récupération du fichier : ${url}`,
									);
								}
								return response.text();
							});
						});
						Promise.all(promises)
							.then((data) => {
								md = md + "\n\n" + data.join("\n\n");
								chatData = parseMarkdown(md, yaml);
								controlChatbot(chatData);
							})
							.catch((error) => console.error(error));
					} else {
						const isNotMarkdown = !md.includes("# ");
						if (isNotMarkdown) {
							md =
								"# Erreur\nL'URL indiquée ne renvoie pas à un fichier en Markdown";
						}
						chatData = parseMarkdown(md, yaml);
						controlChatbot(chatData);
					}
				})
				.catch((error) =>
					fetch(config.corsProxy + sourceChatBot)
						.then((response) => response.text())
						.then((data) => {
							const md = data;
							const isNotMarkdown = !md.includes("# ");
							if (isNotMarkdown) {
								md =
									"# Erreur\nL'URL indiquée ne renvoie pas à un fichier en Markdown";
							}
							const yaml = processYAML(md);
							chatData = parseMarkdown(md, yaml);
							controlChatbot(chatData);
						})
						.catch((error) => console.error(error)),
				);
		}
	} else {
		const yaml = processYAML(defaultMD);
		chatData = parseMarkdown(defaultMD, yaml);
		controlChatbot(chatData);
	}
}
