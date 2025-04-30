import { yaml } from "../../markdown/custom/yaml.mjs";
import {
	shouldBeRandomized,
	randomizeArrayWithFixedElements,
} from "../../utils/arrays.mjs";
import { evaluateExpression } from "../../markdown/custom/variablesDynamic.mjs";
import { processDirectiveSelect } from "../../markdown/custom/directivesAndBlocks.mjs";
import { createChatMessage } from "../messages/create.mjs";

export function responseToSelectedOption(chatbot, optionLink) {
	// Gestion de la réponse à envoyer si on sélectionne une des options proposées
	if (optionLink != "") {
		const chatData = chatbot.data;
		const chatDataLength = chatData.length;
		for (let i = 0; i < chatDataLength; i++) {
			let title = chatData[i][0];
			title = yaml.obfuscate ? btoa(title) : title;
			if (optionLink == title) {
				let response = chatData[i][2];
				const options = chatData[i][3];
				response = Array.isArray(response) ? response.join("\n\n") : response;
				chatbot.optionsLastResponse = options;
				response = options
					? gestionOptions(chatbot, response, options)
					: response;
				createChatMessage(chatbot, response, false);
				break;
			}
		}
	} else {
		const initialMessage = chatbot.initialMessage;
		createChatMessage(chatbot, initialMessage, false);
	}
}

export function gestionOptions(chatbot, response, options) {
	// Si on a du contenu dynamique et qu'on utilise <!-- if @VARIABLE==VALEUR … --> on filtre d'abord les options si elles dépendent d'une variable
	let dynamicVariables = chatbot.dynamicVariables;
	if (yaml && yaml.dynamicContent && Object.keys(dynamicVariables).length > 0) {
		if (options) {
			options = options.filter((element) => {
				let condition = element[3];
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
	[response, options] = processDirectiveSelect(response, options);

	// On teste s'il faut mettre de l'aléatoire dans les options
	if (shouldBeRandomized(options)) {
		options = randomizeArrayWithFixedElements(options);
	}
	if (options) {
		chatbot.optionsLastResponse = options;
		// Gestion du cas où il y a un choix possible entre différentes options après la réponse du chatbot
		let messageOptions = '\n<ul class="messageOptions">';
		const optionsLength = options.length;
		for (let i = 0; i < optionsLength; i++) {
			const option = options[i];
			const optionText = option[0];
			const optionLink = option[1];
			messageOptions =
				messageOptions +
				'<li><a href="#' +
				optionLink +
				'">' +
				optionText +
				"</a></li>\n";
		}
		messageOptions = messageOptions + "</ul>";
		response = response + messageOptions;
	} else {
		chatbot.optionsLastResponse = null;
	}
	return response;
}
