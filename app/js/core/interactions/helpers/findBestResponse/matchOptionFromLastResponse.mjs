import { responseToSelectedOption } from "../choiceOptions.mjs";
import { removeAccents } from "../../../../utils/nlp.mjs";

export function matchOptionFromLastResponse(chatbot, userInput) {
	const choiceOptions = chatbot.optionsLastResponse;
	if (!choiceOptions) return null;
	const matchIndex = choiceOptions.findIndex(
		(choiceOption) =>
			removeAccents(choiceOption.text.toLowerCase()) === userInput,
	);
	if (matchIndex > -1) {
		const choiceOptionLink = choiceOptions[matchIndex].link;
		return responseToSelectedOption(chatbot, choiceOptionLink);
	}
	return null;
}
