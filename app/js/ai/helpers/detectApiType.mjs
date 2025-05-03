// Fonction pour détecter le type d'API en fonction du contenu
export function detectApiType(chunkElement) {
	try {
		const chunkObject = JSON.parse(chunkElement);
		if (chunkObject.message) {
			return "ollama";
		} else if (
			chunkObject.choices &&
			chunkObject.choices[0] &&
			chunkObject.choices[0].delta &&
			chunkObject.choices[0].delta.content
		) {
			return "openai";
		}
	} catch (error) {
		console.warn("Erreur lors de la détection du type d'API :", error);
	}
	return null;
}
