import { yaml } from "../../markdown/custom/yaml.mjs";
import { processCopyCode } from "../../markdown/custom/directivesAndBlocks.mjs";
import { chatContainer } from "../../shared/selectors.mjs";
import { startTypeWriter } from "./typewriter/start";

export function displayMessage(html, isUser, chatMessage, container) {
	return new Promise((resolve) => {
		// On affiche le message dans un container. Par défaut on affiche le message comme un nouveau message dans le chat, mais on peut définir un container (pour afficher le message comme un élément enfant d'un nouveau message en cas de génération de message à la fois via le markdown et un LLM : dans ce cas, il faut que le contenu des messages se suivent, dans un même message, au lieu d'ajouter un nouveau message à chaque fois)
		if (html) {
			if (container) {
				chatContainer.appendChild(container);
			} else {
				container = chatContainer;
			}
			container.appendChild(chatMessage);
			html = isUser ? html : processCopyCode(html);
			// Effet machine à écrire : seulement quand c'est le chatbot qui répond, sinon affichage direct
			// Pas d'effet machine à écrire s'il y a la préférence : "prefers-reduced-motion"
			if (
				isUser ||
				window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
				yaml.typeWriter === false
			) {
				// La désactivation de l'effet typewriter avec les backticks n'est plus nécessaire : on les supprime, et on supprime également les pauses (par exemple : ^100)
				html = html.replaceAll("`", "").replace(/\^\d+/g, "");
				chatMessage.innerHTML = html;
				resolve();
			} else {
				startTypeWriter(html, chatMessage).then(() => resolve());
			}
		} else {
			resolve();
		}
	});
}
