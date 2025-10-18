import { chatContainer } from "../../../shared/selectors.mjs";

const defaultContainer = chatContainer;

// Par défaut on affiche le message comme un nouveau message dans le chat, mais on peut définir un container (pour afficher le message comme un élément enfant d'un nouveau message en cas de génération de message à la fois via le markdown et un LLM : dans ce cas, il faut que le contenu des messages se suivent, dans un même message, au lieu d'ajouter un nouveau message à chaque fois)
export function appendMessageToContainer(htmlMessage, customContainer) {
	if (customContainer && customContainer != defaultContainer) {
		defaultContainer.appendChild(customContainer);
		customContainer.appendChild(htmlMessage);
	} else {
		defaultContainer.appendChild(htmlMessage);
	}
}

let idMessage = 0;

export function createMessageElement(isUser) {
	const el = document.createElement("div");
	el.classList.add("message", isUser ? "user-message" : "bot-message");
	el.id = "message-" + idMessage;
	idMessage++;
	return el;
}
