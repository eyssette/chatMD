// Pour envoyer un message d'erreur si la connexion au LLM n'a pas été correctement configurée ou bien si cette connexion ne fonctionne pas
export function errorMessage(options) {
	const error = options && options.error;
	const container = options && options.container;
	const inline = options && options.inline;
	const errorMessageElement = document.createElement("div");
	if (!inline) {
		errorMessageElement.classList.add("message");
		errorMessageElement.classList.add("bot-message");
	}
	container.appendChild(errorMessageElement);
	errorMessageElement.innerHTML =
		"<p>Pour répondre à cette question, je dois faire appel à une IA générative : la connexion à cette IA n'a pas été correctement configurée ou bien ne fonctionne pas</p>";
	if (error) {
		console.error("Erreur:", error.message);
		console.log("Une erreur s'est produite : " + error);
	}
}
