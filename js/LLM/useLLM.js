import { chatContainer } from "../typewriter";
import { yaml } from "../yaml";

let LLMactive = false;

// Pour pouvoir lire le stream diffusé par l'API utilisée pour se connecter à une IA
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

// On utilise une variable LLMactive pour indiquer l'état d'activité du LLM
document.body.addEventListener("click", () => {
	LLMactive = false;
})
document.body.addEventListener("keypress", (event) => {
	if (event.key === "Enter") {
		LLMactive = false;
	}
})

// Configuration de l'accès au LLM
let bodyObject = {
	model: yaml.useLLM.model,
	stream: true,
	max_tokens: yaml.useLLM.maxTokens,
	frequency_penalty: 0,
	presence_penalty: 0,
	temperature: 0.7,
	top_p: 0.95,
}

// Pour envoyer un message d'erreur si la connexion au LLM n'a pas été correctement configurée ou bien si cette connexion ne fonctionne pas
function messageIfErrorWithGetAnswerFromLLM(error) {
	const errorMessageElement = document.createElement("div");
	errorMessageElement.classList.add("message");
	errorMessageElement.classList.add("bot-message");
	chatContainer.appendChild(errorMessageElement);
	errorMessageElement.textContent = "Pour répondre à cette question, je dois faire appel à une IA générative : la connexion à cette IA n'a pas été correctement configurée ou bien ne fonctionne pas";
	if(error) {
		console.error("Erreur:", error.message);
		console.log("Une erreur s'est produite : " + error);
	}
}

// Fonction pour récupérer une réponse d'un LLM à partir d'un prompt
export function getAnswerFromLLM(userPrompt, informations) {
	if (informations.length>0) {
		informations = yaml.useLLM.RAGprompt+informations
	}
	const isCohere = yaml.useLLM.url.includes('cohere');

	if (isCohere) {
		bodyObject.message = yaml.useLLM.preprompt+userPrompt+yaml.useLLM.postprompt+informations;
	} else {
		bodyObject.messages = [
			{
				content: yaml.useLLM.systemPrompt,
				role: "system",
			},
			{
				content: yaml.useLLM.preprompt+userPrompt+yaml.useLLM.postprompt+informations,
				role: "user",
			},
		]
	}
	try {
		fetch(yaml.useLLM.url, {
			method: "POST",
			headers: {
				"Authorization": "Bearer "+yaml.useLLM.apiKey,
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
					chatContainer.appendChild(chatMessage);
					readStream(response.body, chatMessage, isCohere)
				} else {
					messageIfErrorWithGetAnswerFromLLM()
				}
		}).catch((error) => {
			messageIfErrorWithGetAnswerFromLLM(error)
		})
	} catch(error) {
		messageIfErrorWithGetAnswerFromLLM(error)
	};
}