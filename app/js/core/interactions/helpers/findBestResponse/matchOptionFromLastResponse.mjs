import { responseToSelectedOption } from "../choiceOptions.mjs";
import { removeAccents } from "../../../../utils/nlp.mjs";

export function matchOptionFromLastResponse(chatbot, userInput) {
	const options = chatbot.optionsLastResponse;
	if (!options) return null;

	const matchIndex = options.findIndex(
		([key]) => removeAccents(key.toLowerCase()) === userInput,
	);
	if (matchIndex > -1) {
		const optionLink = options[matchIndex][1];
		return responseToSelectedOption(chatbot, optionLink);
	}
	return null;
}
