import { config } from "../../config.mjs";
import { yaml, filterBadWords } from "../../markdown/custom/yaml.mjs";
import { topElements, getRandomElement } from "../../utils/arrays.mjs";
import {
	removeAccents,
	hasLevenshteinDistanceLessThan,
	cosineSimilarity,
	longestCommonSubstringWeightedLength,
} from "../../utils/nlp.mjs";
import { getAnswerFromLLM } from "../../ai/api.mjs";
import {
	getRAGcontent,
	vectorRAGinformations,
	RAGcontent,
} from "../../ai/rag/engine.mjs";
import {
	responseToSelectedOption,
	processMessageWithChoiceOptions,
} from "./choiceOptions.mjs";

let randomDefaultMessageIndex = Math.floor(
	Math.random() * config.defaultMessage.length,
);
let randomDefaultMessageIndexLastChoice = [];

const LEVENSHTEIN_THRESHOLD = 3; // Seuil de similarité (tolérance des fautes d'orthographe et des fautes de frappe)
const MATCH_SCORE_IDENTITY = 30; // Pour régler le fait de privilégier l'identité d'un keyword à la simple similarité
const BESTMATCH_THRESHOLD = 0.545; // Seuil pour que le bestMatch soit pertinent
const WORD_LENGTH_FACTOR = 0.1; // Prise en compte de la taille des keywords (plus les keywords sont grands, plus ils doivent avoir un poids important)

if (yaml && yaml.useLLM.url && yaml.useLLM.RAGinformations) {
	getRAGcontent(yaml.useLLM.RAGinformations);
}

export function chatbotResponse(chatbot, inputText) {
	let chatData = chatbot.data;

	const chatDataLength = chatData.length;
	// Cas où on va directement à un prochain message (sans même avoir à tester la présence de keywords)
	if (chatbot.nextMessage.goto != "" && !chatbot.nextMessage.onlyIfKeywords) {
		inputText = chatbot.nextMessage.goto;
	}
	let RAGbestMatchesInformation = "";
	let questionToLLM;
	if (yaml && yaml.useLLM.url) {
		inputText = inputText.replace(
			'<span class="hidden">!useLLM</span>',
			"!useLLM",
		);
		questionToLLM = inputText.trim().replace("!useLLM", "");
		if (yaml && yaml.useLLM.RAGinformations) {
			// On ne retient dans les informations RAG que les informations pertinentes par rapport à la demande de l'utilisateur
			const cosSimArray = vectorRAGinformations.map((vectorRAGinformation) =>
				cosineSimilarity(questionToLLM, vectorRAGinformation, {
					boostIfKeywordsInTitle:
						chatbot.nextMessage && chatbot.nextMessage.goto,
				}),
			);
			const RAGbestMatchesIndexes = topElements(
				cosSimArray,
				yaml.useLLM.RAGmaxTopElements,
			);
			RAGbestMatchesInformation = RAGbestMatchesIndexes.map(
				(element) => RAGcontent[element[1]],
			).join("\n");
		}
	}

	// Choix de la réponse que le chatbot va envoyer
	if (yaml && yaml.detectBadWords === true && filterBadWords) {
		if (filterBadWords.check(inputText)) {
			return getRandomElement(config.badWordsMessage);
		}
	}

	let bestMatch = null;
	let bestMatchScore = 0;
	let bestDistanceScore = 0;
	let userInputTextToLowerCase = removeAccents(inputText.toLowerCase());
	let indexBestMatch;

	let optionsLastResponseKeysToLowerCase;
	let indexLastResponseKeyMatch;
	let optionsLastResponse = chatbot.optionsLastResponse;
	if (optionsLastResponse) {
		// On va comparer le message de l'utilisateur aux dernières options proposées s'il y en a une
		optionsLastResponseKeysToLowerCase = optionsLastResponse.map((element) => {
			return element[0].toLowerCase();
		});
		indexLastResponseKeyMatch = optionsLastResponseKeysToLowerCase.indexOf(
			userInputTextToLowerCase,
		);
	}

	if (optionsLastResponse && indexLastResponseKeyMatch > -1) {
		// Si le message de l'utilisateur correspond à une des options proposées, on renvoie directement vers cette option
		const optionLink = optionsLastResponse[indexLastResponseKeyMatch][1];
		const response = responseToSelectedOption(chatbot, optionLink);
		return response;
	} else {
		/* Sinon, on cherche la meilleure réponse possible en testant l'identité ou la similarité entre les mots ou expressions clés de chaque réponse possible et le message envoyé */
		if (chatDataLength > 0 && chatData[0][0]) {
			for (let i = 0; i < chatDataLength; i++) {
				const titleResponse = chatData[i][0];
				const keywordsResponse = chatData[i][1];
				// Si on a la directive !Next ou !SelectNext, on teste seulement la similarité avec la réponse vers laquelle on doit aller et on saute toutes les autres réponses
				if (
					(chatbot.nextMessage.onlyIfKeywords &&
						titleResponse != chatbot.nextMessage.goto) ||
					(chatbot.nextMessage.selected &&
						titleResponse != chatbot.nextMessage.selected)
				) {
					continue;
				}
				// Si on a la directive !Next, alors si la réponse à tester ne contient pas de conditions, on va directement vers cette réponse
				if (
					chatbot.nextMessage.onlyIfKeywords &&
					titleResponse == chatbot.nextMessage.goto &&
					keywordsResponse.length == 0
				) {
					userInputTextToLowerCase = removeAccents(
						chatbot.nextMessage.goto.toLowerCase(),
					);
				}
				// Si on a la directive !Next, alors on ne teste pas la correspondance avec le titre, mais seulement avec les keywords (sauf s'il n'y a pas de keyword)
				// Sinon on inclut le titre
				// On met tout en minuscule
				const keywords =
					chatbot.nextMessage.onlyIfKeywords && keywordsResponse.length > 0
						? keywordsResponse.map((keyword) => keyword.toLowerCase())
						: keywordsResponse
								.concat(titleResponse)
								.map((keyword) => keyword.toLowerCase());
				const responses = chatData[i][2];
				let matchScore = 0;
				let distanceScore = 0;
				if (yaml && yaml.searchInContent) {
					const vectorChatBotResponses = chatbot.vectorChatBotResponses;
					const cosSim = cosineSimilarity(
						userInputTextToLowerCase,
						vectorChatBotResponses[i],
						{
							boostIfKeywordsInTitle:
								chatbot.nextMessage && chatbot.nextMessage.goto,
						},
					);
					matchScore = matchScore + cosSim + 0.5;
				}
				for (let keyword of keywords) {
					// On prend en compte les keywords négatifs (on ne doit pas les voir dans la question de l'utilisateur)
					const isNegativeKeyword = keyword.startsWith("! ");
					keyword = keyword.replace(/^!\s/, "");
					keyword = removeAccents(keyword);
					if (
						userInputTextToLowerCase.includes(keyword) &&
						!isNegativeKeyword
					) {
						// Test de l'identité stricte
						let strictIdentityMatch = false;
						if (chatbot.nextMessage.onlyIfKeywords) {
							// Si on utilise la directive !Next, on vérifie que le keyword n'est pas entouré de lettres ou de chiffres dans le message de l'utilisateur
							const regexStrictIdentityMatch = new RegExp(`\\b${keyword}\\b`);
							if (regexStrictIdentityMatch.test(userInputTextToLowerCase)) {
								strictIdentityMatch = true;
							}
						} else {
							strictIdentityMatch = true;
						}
						if (strictIdentityMatch) {
							// En cas d'identité stricte, on monte le score d'une valeur plus importante que 1 (définie par MATCH_SCORE_IDENTITY)
							matchScore = matchScore + MATCH_SCORE_IDENTITY;
							// On privilégie les correspondances sur les keywords plus longs
							matchScore = matchScore + keyword.length * WORD_LENGTH_FACTOR;
						}
					} else if (
						(userInputTextToLowerCase.length > 5) &
						(keyword.length > 4 || isNegativeKeyword)
					) {
						// Sinon : test de la similarité (seulement si le message de l'utilisateur n'est pas très court)
						// On calcule la distance de Levenshtein entre le keyword et la question de l'utilisateur (en parcourant les n-grammes du message de l'utilisateur et en prenant en compte la longueur du n-gramme ; avec n = nombre de mots du keyword)
						const levenshteinDistance = hasLevenshteinDistanceLessThan(
							userInputTextToLowerCase,
							keyword,
							LEVENSHTEIN_THRESHOLD,
							WORD_LENGTH_FACTOR,
						);
						// Si le keyword est négatif on diminue le score, sinon on l'augmente
						distanceScore = isNegativeKeyword
							? distanceScore - levenshteinDistance
							: levenshteinDistance > 1
								? distanceScore + levenshteinDistance
								: distanceScore;
						if (!isNegativeKeyword && !chatbot.nextMessage.onlyIfKeywords) {
							// Si on n'a pas de keyword négatif on prend en compte la plus longue chaîne commune de caractères (sauf si on doit passer au message seulement s'il y a présence du keyword [cas d'un quiz] : dans ce cas, on doit être plus strict et tester seulement la proximité avec la distance de Levenshtein pour simplement autoriser quelques fautes d'orthographe)
							distanceScore =
								distanceScore +
								longestCommonSubstringWeightedLength(
									userInputTextToLowerCase,
									keyword,
									WORD_LENGTH_FACTOR,
								);
						}
					}
				}
				// si on a un score de distance négatif, c'est qu'il y avait des keywords négatifs : donc le matchscore doit être égal à 0
				if (distanceScore < 0) {
					matchScore = 0;
				}
				if (
					(matchScore == 0 || yaml.searchInContent) &&
					!chatbot.nextMessage.onlyIfKeywords
				) {
					// En cas de simple similarité : on monte quand même le score. Mais si on est dans le mode où on va directement à une réponse en testant la présence de keywords, la correspondance doit être stricte, on ne fait pas de calcul de similarité
					if (distanceScore > bestDistanceScore) {
						matchScore = matchScore + distanceScore;
						bestDistanceScore = distanceScore;
					}
				}
				// Si on a la directive !Next : titre réponse, alors on augmente de manière importante le matchScore si on a un matchScore > 0.5 et que la réponse correspond au titre de la réponse voulue dans la directive
				if (
					matchScore > 0.5 &&
					chatbot.nextMessage.onlyIfKeywords &&
					titleResponse == chatbot.nextMessage.goto
				) {
					matchScore = matchScore + MATCH_SCORE_IDENTITY;
				}
				if (matchScore > bestMatchScore) {
					bestMatch = responses;
					bestMatchScore = matchScore;
					indexBestMatch = i;
				}
			}
		}
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
			let optionsSelectedResponse = bestMatch
				? chatData[indexBestMatch][3]
				: [];
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
			if (
				(yaml.useLLM.url && yaml.useLLM.model && yaml.useLLM.always) ||
				inputText.includes("!useLLM")
			) {
				getAnswerFromLLM(
					questionToLLM.trim(),
					selectedResponseWithoutOptions + "\n" + RAGbestMatchesInformation,
				);
				return;
			} else {
				return selectedResponseWithOptions;
			}
		} else {
			if (
				(yaml.useLLM.url && yaml.useLLM.model && yaml.useLLM.always) ||
				inputText.includes("!useLLM")
			) {
				getAnswerFromLLM(questionToLLM, RAGbestMatchesInformation);
				return;
			} else {
				// En cas de correspondance non trouvée, on envoie un message par défaut (sélectionné au hasard dans la liste définie par defaultMessage)
				// On fait en sorte que le message par défaut envoyé ne soit pas le même que les derniers messages par défaut envoyés
				while (
					randomDefaultMessageIndexLastChoice.includes(
						randomDefaultMessageIndex,
					)
				) {
					randomDefaultMessageIndex = Math.floor(
						Math.random() * config.defaultMessage.length,
					);
				}
				if (randomDefaultMessageIndexLastChoice.length > 4) {
					randomDefaultMessageIndexLastChoice.shift();
				}
				randomDefaultMessageIndexLastChoice.push(randomDefaultMessageIndex);
				let messageNoAnswer = config.defaultMessage[randomDefaultMessageIndex];
				if (
					yaml &&
					yaml.useLLM.url &&
					yaml.useLLM.model &&
					!yaml.useLLM.always
				) {
					const optionMessageNoAnswer = [
						[
							"Voir une réponse générée par une IA",
							"!useLLM " + inputText.replaceAll('"', "“"),
						],
					];
					messageNoAnswer = processMessageWithChoiceOptions(
						chatbot,
						messageNoAnswer,
						optionMessageNoAnswer,
					);
				}
				return messageNoAnswer;
			}
		}
	}
}
