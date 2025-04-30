import {
	extractIntroduction,
	extractInformationsFromInitialMessage,
} from "../../../../../app/js/core/chatbot/parsers/extractIntroduction.mjs";

describe("extractIntroduction", () => {
	it("extracts the title, the initial message and the end of the introduction correctly", () => {
		const input = `# Title\nThis is an intro.\nMultiple lines\n\n are authorized !\n## Section`;
		const result = extractIntroduction(input);

		expect(result.chatbotTitle).toEqual(["Title"]);
		expect(result.chatbotInitialMessage.trim()).toEqual(
			"This is an intro.\nMultiple lines\n\n are authorized !",
		);
		expect(result.indexEnd).toBe(input.trim().indexOf("## Section"));
	});

	it("extracts the title, the initial message and the end of the introduction correctly, even if the beginning of the main content is a heading in Markdown which is not a level 2 heading", () => {
		const input = `# Title\nThis is an intro.\nMultiple lines\n\n are authorized !\n### Section`;
		const result = extractIntroduction(input);

		expect(result.chatbotTitle).toEqual(["Title"]);
		expect(result.chatbotInitialMessage.trim()).toEqual(
			"This is an intro.\nMultiple lines\n\n are authorized !",
		);
		expect(result.indexEnd).toBe(input.trim().indexOf("### Section"));
	});

	it("extracts the title, the initial message and the end of the introduction correctly, even if the beginning of the main content is the second level 1 heading", () => {
		const input = `# Title\nThis is an intro.\nMultiple lines\n\n are authorized !\n# Section`;
		const result = extractIntroduction(input);

		expect(result.chatbotTitle).toEqual(["Title"]);
		expect(result.chatbotInitialMessage.trim()).toEqual(
			"This is an intro.\nMultiple lines\n\n are authorized !",
		);
		expect(result.indexEnd).toBe(input.trim().indexOf("# Section"));
	});

	it("extracts the title, the message and the end of the introduction correctly, even if there are return or whitespaces characters before or after the title", () => {
		const input = ` \n # Title  \n\nThis is an intro.\n## Section`;
		const result = extractIntroduction(input);

		expect(result.chatbotTitle).toEqual(["Title"]);
		expect(result.chatbotInitialMessage.trim()).toEqual("This is an intro.");
		expect(result.indexEnd).toBe(input.trim().indexOf("## Section"));
	});

	it("defaults to 'Chatbot' if no title is found", () => {
		const input = `Intro text\n## Next section`;
		const result = extractIntroduction(input);

		expect(result.chatbotTitle).toEqual(["Chatbot"]);
		expect(result.chatbotInitialMessage.trim()).toEqual("Intro text");
	});

	it("considers the whole text as the introduction if there is no other markdown titles in the content", () => {
		const input = ` # Title  \n\nThis is an intro.\nAnd there is no other content.`;
		const result = extractIntroduction(input);

		expect(result.chatbotTitle).toEqual(["Title"]);
		expect(result.chatbotInitialMessage.trim()).toEqual(
			"This is an intro.\nAnd there is no other content.",
		);
		expect(result.indexEnd).toBe(input.trim().length);
	});
});

describe("extractInformationsFromInitialMessage", () => {
	const yaml = { obfuscate: false };

	it("splits intro, detects choices (with choice text, choice link and random status)", () => {
		const input = `Welcome!\n1. [First choice](First option)\n2) [Second choice](Second option)`;
		const [content, choices] = extractInformationsFromInitialMessage(
			input,
			yaml,
		);

		expect(content).toEqual(["Welcome!"]);
		expect(choices.length).toBe(2);
		expect(choices[0]).toEqual(["First choice", "First option", false]);
		expect(choices[1]).toEqual(["Second choice", "Second option", true]);
	});

	it("handles obfuscation when enabled", () => {
		const obfuscatedYaml = { obfuscate: true };
		const input = `Test\n1. [text](obfuscated Link)`;
		const [content, choices] = extractInformationsFromInitialMessage(
			input,
			obfuscatedYaml,
		);

		const expectedLink = btoa("obfuscated Link");
		expect(choices[0][1]).toBe(expectedLink);
		expect(content).toEqual(["Test"]);
	});

	it("returns only content when no list is found", () => {
		const input = `Line one\nLine two`;
		const [content, choices] = extractInformationsFromInitialMessage(
			input,
			yaml,
		);

		expect(content).toEqual(["Line one", "Line two"]);
		expect(choices).toEqual([]);
	});
});
