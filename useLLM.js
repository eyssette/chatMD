let urlChatCompletions = "http://localhost:1337/v1/chat/completions";
let model = "mistral-ins-7b-q4";
let systemPrompt = "Tu es un assistant efficace et tu réponds en français sauf si on te demande une réponse dans une autre langue. Les phrases de réponse doivent être courtes et claires.";
let question = "Qui est Michael Jordan ?";
let userPrompt = question;
let maxTokens = 100;
let answerFromLLM = [];
let LLMactive = false;
const chatContainerElement = document.getElementById("chat");
let idAnswer = 0;

//getAnswerFromLLM(userPrompt);

// Une fonction pour lire la réponse streamée du LLM
async function readStream(streamableObject, id) {
	const reader = streamableObject.getReader();
	const decoder = new TextDecoder();
	answerFromLLM[id] = '';
	while (true && LLMactive) {
		const { value, done } = await reader.read();
		if (done) {
			LLMactive = false;
			break;
		}
		let chunkString = decoder.decode(value, { stream: true });
		let chunkObject = {};
		let chunkMessage = "";
		if (!chunkString.includes("data: [DONE]") && chunkString.split('"choices"').length==1) {
			// Traitement des chunks (sauf les derniers)
			const indexStartObject = chunkString.indexOf('{"choices');
			chunkString = chunkString.substring(indexStartObject);
			//console.log('CAS 1')
			//console.log(chunkString)
			chunkObject = JSON.parse(chunkString.trim());
			chunkMessage = chunkObject.choices[0].delta.content;
			// on ajoute le nouveau chunk à la réponse du LLM
			answerFromLLM[id] = answerFromLLM[id] + chunkMessage;
			// console.log(answerFromLLM[id]);
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
					//console.log('CAS 2')
					//console.log(chunkArrayElement)
					chunkObject = JSON.parse(chunkArrayElement.trim());
					chunkMessage = chunkObject.choices[0].delta.content;
					// on ajoute le nouveau chunk à la réponse du LLM
					answerFromLLM[id] = answerFromLLM[id] + chunkMessage;
					// console.log(answerFromLLM[id]);
				}
			}
		}
	}
}

document.body.addEventListener("click", () => {
	LLMactive = false;
})
document.body.addEventListener("keypress", (event) => {
	if (event.key === "Enter") {
		LLMactive = false;
	}
})

// Fonction pour récupérer une réponse d'un LLM à partir d'un prompt
function getAnswerFromLLM(userPrompt) {
	idAnswer++;
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
			frequency_penalty: 0,
			presence_penalty: 0,
			temperature: 0.7,
			top_p: 0.95,
		}),
	})
		.then((response) => {
			LLMactive = true;
			const chatMessage = document.createElement("div");
			chatMessage.classList.add("message");
			chatMessage.classList.add("bot-message");
			chatContainerElement.appendChild(chatMessage);
			readStream(response.body,idAnswer);
			const intervalId = setInterval(() => {
				if (LLMactive) {
					chatMessage.innerHTML = answerFromLLM[idAnswer];
				} else {
					chatMessage.innerHTML = answerFromLLM[idAnswer] + '…';
					clearInterval(intervalId);
				}
			}, 50);
		})
		.catch((error) => {
			console.error("Erreur:", error.message);
			console.log("Une erreur s'est produite : " + error);
		});
}