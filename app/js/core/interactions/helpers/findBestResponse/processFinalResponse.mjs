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
	let chatbotResponses = chatbot.responses;
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
		let selectedResponseWithoutChoiceOptions = bestMatch
			? Array.isArray(bestMatch)
				? bestMatch.join("\n\n")
				: bestMatch
			: "";
		let choiceOptionsSelectedResponse = bestMatch
			? chatbotResponses[indexBestMatch].choiceOptions
			: [];
		// Cas où on veut aller directement à un prochain message mais seulement si la réponse inclut les keywords correspondant (sinon on remet le message initial)
		let selectedResponseWithChoiceOptions;
		if (
			chatbot.nextMessage.onlyIfKeywords &&
			bestMatchScore < BESTMATCH_THRESHOLD
		) {
			// En cas de mauvaise réponse
			selectedResponseWithChoiceOptions =
				chatbot.nextMessage.lastMessageFromBot.includes(
					chatbot.nextMessage.messageIfKeywordsNotFound,
				)
					? chatbot.nextMessage.lastMessageFromBot
					: chatbot.nextMessage.messageIfKeywordsNotFound +
						chatbot.nextMessage.lastMessageFromBot;
		} else {
			// En cas de bonne réponse
			selectedResponseWithChoiceOptions = processMessageWithChoiceOptions(
				chatbot,
				selectedResponseWithoutChoiceOptions,
				choiceOptionsSelectedResponse,
			);
		}
		// Si on a dans le yaml useLLM avec le paramètre `always: true` OU BIEN si on utilise la directive !useLLM dans l'input, on utilise un LLM pour répondre à la question
		if (yaml.useLLM.always) {
			const answerFromLLM = processQuestionToLLM(chatbot, userInput, {
				useLLM: true,
				RAG: selectedResponseWithoutChoiceOptions,
			});
			if (answerFromLLM) return null;
		} else {
			return selectedResponseWithChoiceOptions;
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
