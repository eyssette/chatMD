import { yaml } from "../../../markdown/custom/yaml.mjs";
import {
	shouldBeRandomized,
	randomizeArrayWithFixedElements,
} from "../../../utils/arrays.mjs";
import { evaluateExpression } from "../../../markdown/custom/variablesDynamic/evaluateExpression.mjs";
import { processDirectiveSelect } from "../../../markdown/custom/directives/select.mjs";

export function responseToSelectedChoiceOption(chatbot, choiceOptionLink) {
	// Gestion de la réponse à envoyer si on sélectionne une des options proposées
	// Si le lien est vide : on revient au message initial (permet un retour au menu initial)
	if (!choiceOptionLink) {
		return chatbot.initialMessage;
	}
	const chatbotResponses = chatbot.responses;
	const chatbotResponsesLength = chatbotResponses.length;
	for (let i = 0; i < chatbotResponsesLength; i++) {
		let title = chatbotResponses[i].title;
		title = yaml.obfuscate ? btoa(title) : title;
		if (choiceOptionLink == title) {
			let response = chatbotResponses[i].content;
			const choiceOptions = chatbotResponses[i].choiceOptions;
			response = Array.isArray(response) ? response.join("\n\n") : response;
			chatbot.choiceOptionsLastResponse = choiceOptions;
			response = choiceOptions
				? processMessageWithChoiceOptions(chatbot, response, choiceOptions)
				: response;
			return response;
		}
	}
}

export function processMessageWithChoiceOptions(
	chatbot,
	response,
	choiceOptions,
) {
	// Si on a du contenu dynamique et qu'on utilise <!-- if @VARIABLE==VALEUR … --> on filtre d'abord les options si elles dépendent d'une variable
	let dynamicVariables = chatbot.dynamicVariables;
	if (yaml && yaml.dynamicContent) {
		if (choiceOptions) {
			choiceOptions = choiceOptions.filter((option) => {
				let condition = option.condition;
				if (!condition) {
					return true;
				} else {
					// Remplace les variables personnalisées dans la condition
					condition = condition.replace(
						/@([^\s()&|!=<>]+)/g,
						function (match, varName) {
							return (
								'tryConvertStringToNumber(dynamicVariables["' +
								varName.trim() +
								'"])'
							);
						},
					);
					// Gestion des valeurs si elles ne sont pas mises entre guillemets + gestion du cas undefined
					condition = condition
						.replaceAll(
							/(==|!=|<=|>=|<|>) ?(.*?) ?(\)|&|\||$)/g,
							function (match, comparisonSignLeft, value, comparisonSignRight) {
								return `${comparisonSignLeft}"${value}" ${comparisonSignRight}`;
							},
						)
						.replaceAll('""', '"')
						.replace('"undefined"', "undefined");
					return evaluateExpression(condition, dynamicVariables);
				}
			});
		}
	}

	// S'il y a la directive !Select: x on sélectionne aléatoirement seulement x options dans l'ensemble des options disponibles
	[response, choiceOptions] = processDirectiveSelect(response, choiceOptions);

	// On teste s'il faut mettre de l'aléatoire dans les options
	if (shouldBeRandomized(choiceOptions)) {
		choiceOptions = randomizeArrayWithFixedElements(choiceOptions);
	}
	if (choiceOptions) {
		chatbot.choiceOptionsLastResponse = choiceOptions;
		// Gestion du cas où il y a un choix possible entre différentes options après la réponse du chatbot
		let messageOptions = '\n<ul class="messageOptions">';
		const choiceOptionsLength = choiceOptions.length;
		for (let i = 0; i < choiceOptionsLength; i++) {
			const choiceOption = choiceOptions[i];
			const choiceOptionText = choiceOption.text;
			const choiceOptionLink = choiceOption.link;
			messageOptions =
				messageOptions +
				'<li><a href="#' +
				choiceOptionLink +
				'">' +
				choiceOptionText +
				"</a></li>\n";
		}
		messageOptions = messageOptions + "</ul>";
		response = response + messageOptions;
	} else {
		chatbot.choiceOptionsLastResponse = null;
	}
	return response;
}
