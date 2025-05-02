import { config } from "../../../config.mjs";
import { yaml, filterBadWords } from "../../../markdown/custom/yaml.mjs";
import { getRandomElement } from "../../../utils/arrays.mjs";

export function processBadWords(inputText) {
	if (
		yaml &&
		yaml.detectBadWords === true &&
		filterBadWords &&
		filterBadWords.check(inputText)
	) {
		return getRandomElement(config.badWordsMessage);
	}
}
