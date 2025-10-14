export function sendChatbotData(chatbot) {
	if (!chatbot) return;

	const { dynamicVariables = {}, actions = [] } = chatbot;

	// Enregistrement d'un score avec 2 variables : scormScore et scoreMax, à définir dans la source du chatbot
	const score = Number(dynamicVariables["scormScore"]) || 0;
	const scoreMax = Number(dynamicVariables["scormScoreMax"]) || 0;

	// Enregistrement d'un statut de réussite (true / false / undefined) avec la variable scormSuccess, à définir dans la source du chatbot
	const scormSuccess = dynamicVariables["scormSuccess"];
	const success = typeof scormSuccess === "boolean" ? scormSuccess : undefined;

	// Enregistrement d'un éventuel commentaire
	const comment = dynamicVariables["scormComment"] || "";

	// Enregistrement de l'historique des interactions avec le chatbot
	const actionsHistory = Array.isArray(actions) ? actions.join("|") : "";

	// Envoi du message
	const message = {
		source: "chatmd",
		score,
		scoreMax,
		success,
		comment,
		actionsHistory,
	};
	window.parent.postMessage(message, "*");
}
