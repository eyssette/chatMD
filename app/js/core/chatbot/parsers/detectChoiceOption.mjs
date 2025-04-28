const regexOrderedList = /^\d{1,3}(\.|\))\s\[/;
const regexOrderedListRandom = /^\d{1,3}\)/;

export function detectChoiceOption(line) {
	return {
		isChoice: regexOrderedList.test(line),
		isRandom: regexOrderedListRandom.test(line),
	};
}
