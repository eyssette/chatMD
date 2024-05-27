let answerFromLLM = [];
let LLMactive = false;
let idAnswer = 0;

const chatContainerElement = document.getElementById("chat");

//getAnswerFromLLM(userPrompt);

// Une fonction pour lire la réponse streamée du LLM
async function readStreamCohere(streamableObject,id, chatMessage) {
	answerFromLLM[id] = '';
	let chunkMessage = "";
	for await (const chunk of streamableObject) {
		const chunkString = new TextDecoder().decode(chunk)
		const chunkArray = chunkString.trim().split('\n');
		chunkArray.forEach(chunkElement => {
			const chunkObject = JSON.parse(chunkElement.trim());
			if (chunkObject.event_type == 'text-generation') {
				chunkMessage = chunkObject.text
				chatMessage.innerHTML = chatMessage.innerHTML + chunkObject.text
			}
		});
		window.scrollTo(0, document.body.scrollHeight);
	}
}

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

let bodyObject = {
	model: yamlUseLLMmodel,
	stream: true,
	max_tokens: yamlUseLLMmaxTokens,
	frequency_penalty: 0,
	presence_penalty: 0,
	temperature: 0.7,
	top_p: 0.95,
}

// Fonction pour récupérer une réponse d'un LLM à partir d'un prompt
function getAnswerFromLLM(userPrompt, informations) {
	idAnswer++;
	if (informations.length>0) {
		informations = yamlUseLLMragPrompt+informations
	}
	const isCohere = yamlUseLLMurl.includes('cohere');

	if (isCohere) {
		bodyObject.message = yamlUseLLMpreprompt+userPrompt+yamlUseLLMpostprompt+informations;
	} else {
		bodyObject.messages = [
			{
				content: yamlUseLLMsystemPrompt,
				role: "system",
			},
			{
				content: yamlUseLLMpreprompt+userPrompt+yamlUseLLMpostprompt+informations,
				role: "user",
			},
		]
	}

	fetch(yamlUseLLMurl, {
		method: "POST",
		headers: {
			"Authorization": "Bearer "+yamlUseLLMapiKey,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(bodyObject),
	})
		.then((response) => {
			LLMactive = true;
			const chatMessage = document.createElement("div");
			chatMessage.classList.add("message");
			chatMessage.classList.add("bot-message");
			chatContainerElement.appendChild(chatMessage);
			if (isCohere) {
				readStreamCohere(response.body,idAnswer, chatMessage);
			} else {
			const intervalId = setInterval(() => {
				if (LLMactive) {
					chatMessage.innerHTML = answerFromLLM[idAnswer];
				} else {
					chatMessage.innerHTML = answerFromLLM[idAnswer] + '…';
					clearInterval(intervalId);
				}
			}, 50);
			}
		})
		.catch((error) => {
			console.error("Erreur:", error.message);
			console.log("Une erreur s'est produite : " + error);
		});
}