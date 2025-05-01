import { startsWithAnyOf } from "../../../../utils/strings.mjs";

const regexOrderedList = /^\d{1,3}[.)]\s\[[^\]]+\]\(([^)]*)\)\s*$/;
const regexOrderedListRandom = /^\d{1,3}\)/;
const externalLinks = ["http", "mailto:", "tel:"];

function isExternalLink(url) {
	url = url.trim().toLowerCase();
	return startsWithAnyOf(url, externalLinks);
}

export function detectChoiceOption(line) {
	const match = line.match(regexOrderedList);
	let isChoice = false;

	if (match) {
		const url = match[1];
		isChoice = !isExternalLink(url);
	}

	return {
		isChoice: isChoice,
		isRandom: isChoice && regexOrderedListRandom.test(line),
	};
}
