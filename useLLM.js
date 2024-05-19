const urlChatCompletions = "http://localhost:1337/v1/chat/completions";
const model = "mistral-ins-7b-q4";
const systemPrompt = "You are a helpful assistant.";
const question = "Qui est Michael Jordan ?";
const userPrompt = question;
const maxTokens = 11;

getAnswerFromLLM(userPrompt);

// Une fonction pour lire la réponse streamée du LLM
async function readStream(streamableObject) {
	const reader = streamableObject.getReader();
	const decoder = new TextDecoder();
	while (true) {
		const { value, done } = await reader.read();
		if (done) break;
		let chunkString = decoder.decode(value, { stream: true });
		let chunkObject = {};
		let chunkMessage = "";
		if (!chunkString.includes("data: [DONE]")) {
			// Traitement des chunks (sauf les derniers)
			const indexStartObject = chunkString.indexOf('{"choices');
			chunkString = chunkString.substring(indexStartObject);
			chunkObject = JSON.parse(chunkString.trim());
			chunkMessage = chunkObject.choices[0].delta.content;
			// print chunkMessage dans la console
			console.log(chunkMessage);
		} else {
			// Traitement des derniers chunks
			const chunkArray = chunkString.split("\n\n");
			for (let chunkArrayElement of chunkArray) {
				const indexStartObjectArrayElement =
					chunkArrayElement.indexOf('{"choices');
				if (indexStartObjectArrayElement > -1) {
					chunkArrayElement = chunkArrayElement.substring(
						indexStartObjectArrayElement
					);
					chunkObject = JSON.parse(chunkArrayElement.trim());
					chunkMessage = chunkObject.choices[0].delta.content;
					// print chunkMessage dans la console
					console.log(chunkMessage);
				}
			}
		}
	}
}

// Fonction pour récupérer une réponse d'un LLM à partir d'un prompt
function getAnswerFromLLM(userPrompt) {
	fetch(urlChatCompletions, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			messages: [
				{
					content: systemPrompt,
					role: "system",
				},
				{
					content: userPrompt,
					role: "user",
				},
			],
			model: model,
			stream: true,
			max_tokens: maxTokens,
			// stop: ["hello", "Hello", "HELLO", "hELLO"],
			frequency_penalty: 0,
			presence_penalty: 0,
			temperature: 0.7,
			top_p: 0.95,
		}),
	})
		.then((response) => {
			readStream(response.body);
		})
		.catch((error) => {
			console.error("Erreur:", error.message);
			console.log("Une erreur s'est produite : " + error);
		});
}