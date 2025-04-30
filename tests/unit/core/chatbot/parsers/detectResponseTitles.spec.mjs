import {
	getStructureTitles,
	isStructureTitle,
} from "../../../../../app/js/core/chatbot/parsers/detectResponseTitle.mjs";

describe("structureTitles", () => {
	it("returns empty array when yaml is undefined", () => {
		expect(getStructureTitles(undefined)).toEqual([]);
	});

	it("returns empty array when responsesTitles is not an array", () => {
		expect(getStructureTitles({ responsesTitles: null })).toEqual([]);
		expect(getStructureTitles({ responsesTitles: "## " })).toEqual([]);
	});

	it("returns empty array when responsesTitles is an empty array", () => {
		expect(getStructureTitles({ responsesTitles: [] })).toEqual([]);
	});

	it("returns all title prefixes lower than the minimum response title level", () => {
		const yaml = { responsesTitles: ["### ", "#### "] };
		expect(getStructureTitles(yaml)).toEqual(["# ", "## "]);
	});

	it("returns correct structure titles when minimum response title level is 2", () => {
		const yaml = { responsesTitles: ["## ", "### ", "#### "] };
		expect(getStructureTitles(yaml)).toEqual(["# "]);
	});

	it("returns empty array when response title level is 1", () => {
		const yaml = { responsesTitles: ["# "] };
		expect(getStructureTitles(yaml)).toEqual([]);
	});
});

describe("isStructureTitle", () => {
	const yaml = { responsesTitles: ["### ", "#### "] };

	it("returns true for a line with a structure title prefix", () => {
		expect(isStructureTitle("# Introduction", yaml)).toBeTrue();
		expect(isStructureTitle("## Context", yaml)).toBeTrue();
	});

	it("returns false for a line with a response title prefix", () => {
		expect(isStructureTitle("### Answer section", yaml)).toBeFalse();
		expect(isStructureTitle("#### Sub-answer", yaml)).toBeFalse();
	});

	it("returns false for a regular text line", () => {
		expect(isStructureTitle("This is just a paragraph.", yaml)).toBeFalse();
	});

	it("returns false when yaml is missing or malformed", () => {
		expect(isStructureTitle("## Something", null)).toBeFalse();
		expect(isStructureTitle("## Something", {})).toBeFalse();
		expect(
			isStructureTitle("## Something", { responsesTitles: null }),
		).toBeFalse();
	});
});
