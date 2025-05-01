const regexOrderedList = /^\d{1,3}[.)]\s\[[^\]]+\]\(([^)]*)\)\s*$/;
const regexOrderedListRandom = /^\d{1,3}\)/;

export function detectChoiceOption(line) {
	const match = line.match(regexOrderedList);
	const isChoice =
		match && !match[1].trim().toLowerCase().startsWith("http") ? true : false;
	return {
		isChoice: isChoice,
		isRandom: isChoice && regexOrderedListRandom.test(line),
	};
}
