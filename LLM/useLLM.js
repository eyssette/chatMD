let answerFromLLM = [];
let LLMactive = false;
let idAnswer = 0;

const chatContainerElement = document.getElementById("chat");

//getAnswerFromLLM(userPrompt);

async function readStream(streamableObject, chatMessage, isCohere) {
	for await (const chunk of streamableObject) {
		const chunkString = new TextDecoder().decode(chunk);
		const chunkArray = chunkString.trim().split('\n').filter(element => element.trim().length > 0);
		chunkArray.forEach(chunkElement => {
			if(isCohere) {
				const chunkObject = JSON.parse(chunkElement.trim());
				if (chunkObject.event_type == 'text-generation'  && LLMactive) {
					const chunkMessage = chunkObject.text
					chatMessage.innerHTML = chatMessage.innerHTML + chunkMessage
				}
				LLMactive = chunkObject.is_finished ? false : true;
			} else {
				const chunkObjectString = chunkElement.replace('data: ','')
				if(!chunkObjectString.includes('[DONE]') && LLMactive) {
					const chunkObject = JSON.parse(chunkObjectString);
					const chunkMessage = chunkObject.choices[0].delta.content;
					chatMessage.innerHTML = chatMessage.innerHTML + chunkMessage
				} else {
					LLMactive = false;
				}
			}
			window.scrollTo(0, document.body.scrollHeight);
		});
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
	try {
		fetch(yamlUseLLMurl, {
			method: "POST",
			headers: {
				"Authorization": "Bearer "+yamlUseLLMapiKey,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(bodyObject),
		})
			.then((response) => {
				if (response.ok) {
					LLMactive = true;
					const chatMessage = document.createElement("div");
					chatMessage.classList.add("message");
					chatMessage.classList.add("bot-message");
					chatContainerElement.appendChild(chatMessage);
					readStream(response.body, chatMessage, isCohere)
				} else {
					const errorMessageElement = document.createElement("div");
					errorMessageElement.classList.add("message");
					errorMessageElement.classList.add("bot-message");
					chatContainerElement.appendChild(errorMessageElement);
					errorMessageElement.textContent = "L'accès à un LLM n'a pas été configuré, je ne peux pas vous répondre";
				}
		})
	} catch(error) {
		console.error("Erreur:", error.message);
		console.log("Une erreur s'est produite : " + error);
	};
}