import { startsWithAnyOf } from "../../../utils/strings.mjs";

export function detectedResponseTitle(line, yaml) {
	return startsWithAnyOf(line, yaml.responsesTitles);
}

export function getStructureTitles(yaml) {
	const responseTitlesLevels =
		yaml && Array.isArray(yaml.responsesTitles) && yaml.responsesTitles
			? yaml.responsesTitles.map((title) => title.lastIndexOf("#") + 1)
			: [];

	if (responseTitlesLevels.length === 0) {
		return [];
	}

	const minResponseTitlesLevel = Math.min(...responseTitlesLevels);

	const structureTitles = [];
	for (let i = 1; i < minResponseTitlesLevel; i++) {
		structureTitles.push("#".repeat(i) + " ");
	}

	return structureTitles;
}

export function isStructureTitle(line, yaml) {
	const structuredTitles = getStructureTitles(yaml);
	if (!Array.isArray(structuredTitles) || structuredTitles.length == 0)
		return false;
	return startsWithAnyOf(line, structuredTitles) &&
		startsWithAnyOf(line, structuredTitles).length > 0
		? true
		: false;
}
