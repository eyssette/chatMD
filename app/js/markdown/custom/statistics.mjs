let chatbotName;
let chatbotUrl;
const conversationId = generateUUID();

function generateUUID() {
	let d = new Date().getTime();
	if (
		typeof performance !== "undefined" &&
		typeof performance.now === "function"
	) {
		d += performance.now(); // Utilise la haute résolution si disponible
	}
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
		const r = ((d + Math.random() * 16) % 16) | 0;
		d = Math.floor(d / 16);
		return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
	});
}

let index = 0;

export function getStatsData(options = {}) {
	chatbotName = chatbotName
		? chatbotName
		: document.querySelector("h1").textContent;
	chatbotUrl = chatbotUrl ? chatbotUrl : window.location.href;

	const statsData = {
		conversation_id: conversationId,
		chatbot_name: chatbotName,
		chatbot_url: chatbotUrl,
		message_date: new Date().toISOString(),
		message_type: (options && options.type) || "",
		message_subtype: (options && options.subtype) || "",
		message_type_details: (options && options.type_details) || "",
		message_content_raw: (options && options.content_raw) || "",
		message_content_html: (options && options.content_html) || "",
		message_label: (options && options.label) || "",
		message_index: index,
	};
	index++;
	return statsData;
}

export function sendStatsData(yaml, statsData) {
	const destination = yaml && yaml.stats && yaml.stats.destination;
	if (destination === "console") {
		console.log(statsData);
	}
	if (destination.startsWith("http")) {
		// On envoie les données de statistiques à l'URL spécifiée dans le YAML
		fetch(destination, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(statsData),
		}).catch((error) => {
			console.error("Erreur lors de l'envoi des statistiques :", error);
		});
	}
}
