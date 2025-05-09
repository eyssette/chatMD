import { startsWithAnyOf } from "../../../../utils/strings.mjs";

const regexOrderedList = /^\d{1,3}[.)]\s\[([^\]]*?)\]\(([^)]*)\)\s*$/;
const regexOrderedListRandom = /^\d{1,3}\)/;
const externalLinks = ["http", "mailto:", "tel:"];

function isExternalLink(url) {
	url = url.trim().toLowerCase();
	return startsWithAnyOf(url, externalLinks);
}

export function detectChoiceOption(line) {
	const match = line.match(regexOrderedList);
	let isChoice = false;
	let text = "";
	let url = "";

	if (match) {
		text = match[1];
		url = match[2];
		isChoice = !isExternalLink(url);
	}

	return {
		isChoice: isChoice,
		text: text,
		url: url,
		isRandom: isChoice && regexOrderedListRandom.test(line),
	};
}
