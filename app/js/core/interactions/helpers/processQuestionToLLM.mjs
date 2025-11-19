import { yaml } from "../../../markdown/custom/yaml.mjs";
import { getAnswerFromLLM } from "../../../ai/getAnswerFromLLM.mjs";
import { extractRelevantRAGinfo } from "../../../ai/rag/extractRelevantRAGInfo.mjs";

export function processQuestionToLLM(chatbot, inputText, options) {
	if (!yaml || !yaml.useLLM || !yaml.useLLM.url || !yaml.useLLM.model)
		return null;
	// On autorise l'utilisation par l'utilisateur des commandes LLM seulement si la configuration le permet
	if (yaml.useLLM.userCanCallLLM === false) {
		// Si on a désactivé par défaut dans le YAML l'utilisation des commandes LLM, on vérifie si le chatbot les a temporairement autorisées ou pas (utile dans le cas des commandes LLM dans les boutons à cliquer)
		chatbot.allowLLMCommands = chatbot.allowLLMCommands == true ? true : false;
	} else {
		chatbot.allowLLMCommands = true;
	}
	// Vérifier si on doit utiliser le LLM : soit via les options (activation dans le YAML avec useLLM.always), soit via la directive !useLLM dans l'input si c'est autorisé
	const shouldUseLLM =
		options && options.useLLM == true
			? true
			: inputText.includes("!useLLM") && chatbot.allowLLMCommands;
	// On réinitialise à false l'autorisation d'utiliser les commandes LLM après utilisation
	chatbot.allowLLMCommands = false;
	if (!shouldUseLLM) return null;
	let questionToLLM = inputText
		.replace("!useLLM", "")
		.replace('<span class="hidden">/span>', "");
	// Gestion de l'historique des échanges avec le LLM
	let shouldUseConversationHistory = false;
	if (questionToLLM.includes("!useHistory")) {
		shouldUseConversationHistory = true;
		questionToLLM = questionToLLM.replace("!useHistory", "");
	}
	const RAGbestMatchesInformation =
		yaml && yaml.useLLM.RAGinformations
			? extractRelevantRAGinfo(chatbot, questionToLLM)
			: "";
	const RAGinformations =
		options && options.RAG
			? options.RAG + "\n" + RAGbestMatchesInformation
			: RAGbestMatchesInformation;
	getAnswerFromLLM(chatbot, questionToLLM, {
		RAG: RAGinformations,
		useConversationHistory: shouldUseConversationHistory,
	});
	return true;
}
