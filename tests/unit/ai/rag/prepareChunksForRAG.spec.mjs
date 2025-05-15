import { prepareChunksForRAG } from "../../../../app/js/ai/rag/prepareChunks.mjs";

describe("prepareChunksForRAG", function () {
	it("returns non-empty lines split by newline when separator is not provided", function () {
		const input = "Line one\n\nLine two\nLine three\n";
		const result = prepareChunksForRAG(input);
		expect(result).toEqual(["Line one", "Line two", "Line three"]);
	});

	it('splits string into chunks of around 600 characters when separator is "auto"', function () {
		const longText = Array(2500).fill("a").join("");
		const result = prepareChunksForRAG(longText, { separator: "auto" });
		expect(result.length).toBeGreaterThan(1);
		expect(result.join("")).toEqual(longText);
	});

	it("splits using custom separator when provided", function () {
		let yaml = {};
		yaml.useLLM = { RAGseparator: ";" };
		const input = "part1;part2;part3";
		const result = prepareChunksForRAG(input, {
			separator: yaml.useLLM.RAGseparator,
		});
		expect(result).toEqual(["part1", "part2", "part3"]);
	});

	it('splits using "---" and replaces newlines with spaces when RAGseparator is "break"', function () {
		let yaml = {};
		yaml.useLLM = { RAGseparator: "break" };
		const input = "first part---second\npart---third\npart";
		const result = prepareChunksForRAG(input, {
			separator: yaml.useLLM.RAGseparator,
		});
		expect(result).toEqual(["first part", "second\npart", "third\npart"]);
	});

	it("returns an empty array when informations is an empty string and separator is undefined", function () {
		const result = prepareChunksForRAG("", undefined);
		expect(result).toEqual([]);
	});
});
