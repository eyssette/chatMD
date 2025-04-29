const regexOrderedList = /^\d{1,3}[.)]\s\[[^\]]+\]\([^)]+\)\s*$/;
const regexOrderedListRandom = /^\d{1,3}\)/;

export function detectChoiceOption(line) {
	const isChoice = regexOrderedList.test(line);
	return {
		isChoice: isChoice,
		isRandom: isChoice && regexOrderedListRandom.test(line),
	};
}
