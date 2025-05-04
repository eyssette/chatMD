import { yaml } from "../../../../markdown/custom/yaml.mjs";
import { processMessageWithChoiceOptions } from "../choiceOptions.mjs";
import { getDefaultMessage } from "../getDefaultMessage.mjs";
import { processQuestionToLLM } from "../processQuestionToLLM.mjs";

const BESTMATCH_THRESHOLD = 0.545; // Seuil pour que le bestMatch soit pertinent

export function processFinalResponse(
	chatbot,
	userInput,
	bestMatch,
	bestMatchScore,
	indexBestMatch,
) {
	let chatData = chatbot.data;
	// Soit il y a un bestMatch, soit on veut aller directement à un prochain message mais seulement si la réponse inclut les keywords correspondant (sinon on remet le message initial)
	if (bestMatch || chatbot.nextMessage.onlyIfKeywords) {
		if (
			bestMatch &&
			chatbot.nextMessage.onlyIfKeywords &&
			bestMatchScore > BESTMATCH_THRESHOLD
		) {
			// Réinitialiser si on a trouvé la bonne réponse après une directive !Next
			chatbot.nextMessage.lastMessageFromBot = "";
			chatbot.nextMessage.goto = "";
			chatbot.nextMessage.errorsCounter = 0;
			chatbot.nextMessage.onlyIfKeywords = false;
		}
		// On envoie le meilleur choix s'il en existe un
		let selectedResponseWithoutOptions = bestMatch
			? Array.isArray(bestMatch)
				? bestMatch.join("\n\n")
				: bestMatch
			: "";
		let optionsSelectedResponse = bestMatch ? chatData[indexBestMatch][3] : [];
		// Cas où on veut aller directement à un prochain message mais seulement si la réponse inclut les keywords correspondant (sinon on remet le message initial)
		let selectedResponseWithOptions;
		if (
			chatbot.nextMessage.onlyIfKeywords &&
			bestMatchScore < BESTMATCH_THRESHOLD
		) {
			// En cas de mauvaise réponse
			selectedResponseWithOptions =
				chatbot.nextMessage.lastMessageFromBot.includes(
					chatbot.nextMessage.messageIfKeywordsNotFound,
				)
					? chatbot.nextMessage.lastMessageFromBot
					: chatbot.nextMessage.messageIfKeywordsNotFound +
						chatbot.nextMessage.lastMessageFromBot;
		} else {
			// En cas de bonne réponse
			selectedResponseWithOptions = processMessageWithChoiceOptions(
				chatbot,
				selectedResponseWithoutOptions,
				optionsSelectedResponse,
			);
		}
		// Si on a dans le yaml useLLM avec le paramètre `always: true` OU BIEN si on utilise la directive !useLLM dans l'input, on utilise un LLM pour répondre à la question
		if (yaml.useLLM.always) {
			const answerFromLLM = processQuestionToLLM(chatbot, userInput, {
				useLLM: true,
				RAG: selectedResponseWithoutOptions,
			});
			if (answerFromLLM) return null;
		} else {
			return selectedResponseWithOptions;
		}
	} else {
		if (yaml.useLLM.always) {
			const answerFromLLM = processQuestionToLLM(chatbot, userInput, {
				useLLM: true,
			});
			if (answerFromLLM) return null;
		} else {
			// En cas de correspondance non trouvée, on envoie un message par défaut (sélectionné au hasard dans la liste définie par defaultMessage)
			// On fait en sorte que le message par défaut envoyé ne soit pas le même que les derniers messages par défaut envoyés
			return getDefaultMessage(chatbot, userInput);
		}
	}
}
