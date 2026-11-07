import { responseToSelectedChoiceOption } from "../choiceOptions.mjs";
import { removeAccents } from "../../../../utils/nlp.mjs";
import { yaml } from "../../../../markdown/custom/yaml.mjs";

export function matchOptionFromLastResponse(chatbot, userInput) {
	const choiceOptions = chatbot.choiceOptionsLastResponse;
	if (!choiceOptions) return null;
	const matchIndex = choiceOptions.findIndex(
		(choiceOption) =>
			removeAccents(choiceOption.text.toLowerCase()) === userInput,
	);
	if (matchIndex > -1) {
		const choiceOptionLink = choiceOptions[matchIndex].link;
		const response = responseToSelectedChoiceOption(chatbot, choiceOptionLink);
		const shouldCollectStats = yaml && yaml.stats && yaml.stats.collect;
		let stats;
		if (shouldCollectStats) {
			stats = {
				type: "bot",
				subtype: "predefined-answer",
				type_details: "perfect-match-within-last-options",
				content: response,
				label: choiceOptions[matchIndex].text,
			};
		}
		return { response: response, stats: stats };
	}
	return null;
}
