import { config } from "../../../config.mjs";
import { yaml, filterBadWords } from "../../../markdown/custom/yaml.mjs";
import { getRandomElement } from "../../../utils/arrays.mjs";

export function isBadWords(inputText) {
	if (yaml && yaml.detectBadWords === true && filterBadWords) {
		return filterBadWords.check(inputText);
	}
	return false;
}

export function processBadWords(inputText) {
	if (isBadWords(inputText)) {
		return getRandomElement(config.badWordsMessage);
	}
}
