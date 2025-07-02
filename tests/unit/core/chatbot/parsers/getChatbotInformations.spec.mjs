import { getChatbotInformations } from "../../../../../app/js/core/chatbot/parsers/getChatbotInformations.mjs";

describe("getChatbotInformations", () => {
	let yaml = {
		responsesTitles: ["## ", "### "],
		dynamicContent: true,
		obfuscate: false,
	};
	const defaultChatbotTitle = "Chatbot";

	it("returns a single section when one H2 title is found", () => {
		const markdown = `Intro line
## First title
- keyword 1
- keyword 2
Some content
on multiples lines
1. With markup
- in Markdown
1. [Option 1](link 1)
2) [Option 2](link 2)`;
		const result = getChatbotInformations(
			markdown,
			{ chatbotTitle: "", initialMessage: "Intro line", indexEnd: 11 },
			yaml,
		);

		expect(result.length).toBe(2);
		expect(result[1].title).toBe("First title");
		expect(result[1].keywords).toEqual(["keyword 1", "keyword 2"]);
		expect(result[1].content).toEqual([
			"Some content",
			"on multiples lines",
			"1. With markup",
			"- in Markdown",
		]);
		expect(result[1].choiceOptions).toEqual([
			{ text: "Option 1", link: "link 1", isRandom: false, condition: "" },
			{ text: "Option 2", link: "link 2", isRandom: true, condition: "" },
		]);
	});

	it("splits multiple H2 response sections correctly", () => {
		const markdown = `Intro text
## First
- item A
Some content A
1. [goto](Second)
## Second
Some content B`;
		const result = getChatbotInformations(
			markdown,
			{ chatbotTitle: "", initialMessage: "Intro text", indexEnd: 11 },
			yaml,
		);

		expect(result.length).toBe(3);
		expect(result[1].title).toBe("First");
		expect(result[1].keywords).toEqual(["item A"]);
		expect(result[1].choiceOptions).toEqual([
			{ text: "goto", link: "Second", isRandom: false, condition: "" },
		]);
		expect(result[2].title).toBe("Second");
		expect(result[2].keywords).toEqual([]);
	});

	it("handles ordered choice options with random flag and conditions", () => {
		const yamlWithObfuscation = {
			...yaml,
			obfuscate: true,
		};

		const markdown = `## Choices
\`if @loggedIn==true && @user==admin\`
1) [First Option](link 1)
\`endif\`
1. [Second Option](link 2)`;

		const result = getChatbotInformations(
			markdown,
			{ chatbotTitle: "", initialMessage: "", indexEnd: 0 },
			yamlWithObfuscation,
		);

		const {
			text: text1,
			link: link1,
			isRandom: random1,
			condition: condition1,
		} = result[1].choiceOptions[0];
		const {
			text: text2,
			link: link2,
			isRandom: random2,
			condition: condition2,
		} = result[1].choiceOptions[1];

		expect(text1).toBe("First Option");
		expect(atob(link1)).toBe("link 1");
		expect(random1).toBeTrue();
		expect(condition1).toBe("@loggedIn==true && @user==admin");

		expect(text2).toBe("Second Option");
		expect(atob(link2)).toBe("link 2");
		expect(random2).toBeFalse();
		expect(condition2).toBe("");
	});

	it("replaces internal markdown links with HTML anchor tags", () => {
		const markdown = `## Links
See [section one](#section-one) and [section two](#Section two).`;
		const result = getChatbotInformations(
			markdown,
			{ chatbotTitle: "", initialMessage: "", indexEnd: 0 },
			yaml,
		);

		expect(result[1].content).toEqual([
			'See <a href="#section-one">section one</a> and <a href="#Section two">section two</a>.',
		]);
	});

	it("does not consider as part of the content of a section a line that marks the structure of the chabot by using headers whose level is inferior to the level that are used to mark the possible answers of the chatbot ", () => {
		const markdown1 = `### Response Title
Some informative text here.
# This is an H1 title
## Test
Another line of text.`;
		const result1 = getChatbotInformations(
			markdown1,
			{ chatbotTitle: "", initialMessage: "", indexEnd: 0 },
			yaml,
		);

		expect(result1[1].content).toEqual(["Some informative text here."]);
		expect(result1[1].content).not.toContain("This is an H1 title");

		const yaml2 = {
			responsesTitles: ["### "],
			dynamicContent: false,
			obfuscate: false,
		};

		const markdown2 = `### Response Title
Some informative text here.
## This is an H2 title
### Test
Another line of text.`;
		const result2 = getChatbotInformations(
			markdown2,
			{ chatbotTitle: "", initialMessage: "", indexEnd: 0 },
			yaml2,
		);

		expect(result2[1].content).toEqual(["Some informative text here."]);
		expect(result2[1].content).not.toContain("This is an H2 title");

		const yaml3 = {
			responsesTitles: ["#### "],
			dynamicContent: false,
			obfuscate: false,
		};

		const markdown3 = `#### Response Title
Some informative text here.

### This is an H3 title

#### test
Another line of text.`;
		const result3 = getChatbotInformations(
			markdown3,
			{ chatbotTitle: "", initialMessage: "", indexEnd: 0 },
			yaml3,
		);

		expect(result3[1].content).toEqual(["Some informative text here."]);
		expect(result3[1].content).not.toContain("This is an H3 title");
	});

	it("returns only informations in initial message if no response title exists", () => {
		const md = "# Test\nSome intro\nContent continues\nTest";
		const result = getChatbotInformations(
			md,
			{ chatbotTitle: "Test", initialMessage: "", indexEnd: 0 },
			yaml,
		);
		expect(result[0]).toEqual({
			title: "Test",
			keywords: [],
			content: ["Some intro", "Content continues", "Test"],
			choiceOptions: null,
		});
	});

	it("ignores structure-only titles based on isStructureTitle", () => {
		const md = "# Test\n## Hidden\n### Actual\nVisible content";
		const yaml2 = {
			responsesTitles: ["### "],
			dynamicContent: false,
			obfuscate: false,
		};
		const result = getChatbotInformations(
			md,
			{ chatbotTitle: "Test", initialMessage: "", indexEnd: 0 },
			yaml2,
		);
		expect(result[0].title).toEqual("Test");
		expect(result[0].content).toEqual([]);
		expect(result[1]).toEqual({
			title: "Actual",
			content: ["Visible content"],
			choiceOptions: null,
			keywords: [],
		});
	});

	it("handles choiceOption with no text", () => {
		const md = "## Test\nContenu\n1. [](Lien)";
		const result = getChatbotInformations(
			md,
			{ chatbotTitle: "", initialMessage: "", indexEnd: 0 },
			yaml,
		);
		const defaultChoiceOptionText = "suite";

		expect(result[1]).toEqual({
			title: "Test",
			content: ["Contenu"],
			choiceOptions: [
				{
					text: defaultChoiceOptionText,
					link: "Lien",
					isRandom: false,
					condition: "",
				},
			],
			keywords: [],
		});
	});

	it("gets introduction informations and detects choices in initial message (with choice text, choice link and random status)", () => {
		const md =
			"Welcome!\n1. [First choice](First option)\n2) [Second choice](Second option)";
		const result = getChatbotInformations(
			md,
			{ chatbotTitle: "", initialMessage: "Welcome!", indexEnd: 8 },
			yaml,
		);

		expect(result[0]).toEqual({
			title: defaultChatbotTitle,
			content: ["Welcome!"],
			choiceOptions: [
				{
					text: "First choice",
					link: "First option",
					isRandom: false,
					condition: "",
				},
				{
					text: "Second choice",
					link: "Second option",
					isRandom: true,
					condition: "",
				},
			],
			keywords: [],
		});
	});

	it("handles obfuscation in initial message when enabled", () => {
		const obfuscatedYaml = {
			responsesTitles: ["## "],
			dynamicContent: false,
			obfuscate: true,
		};
		const md = "Test\n1. [text](obfuscated Link)";
		const result = getChatbotInformations(
			md,
			{ chatbotTitle: "", initialMessage: "Test", indexEnd: 4 },
			obfuscatedYaml,
		);

		const expectedLink = btoa("obfuscated Link");

		expect(result[0]).toEqual({
			title: defaultChatbotTitle,
			content: ["Test"],
			choiceOptions: [
				{
					text: "text",
					link: expectedLink,
					isRandom: false,
					condition: "",
				},
			],
			keywords: [],
		});
	});

	it("handles choiceOption in initialMessage with no text", () => {
		const md = "Test\n1. [](my link)";
		const defaultChoiceOptionText = "suite";
		const result = getChatbotInformations(
			md,
			{ chatbotTitle: "", initialMessage: "Test", indexEnd: 4 },
			yaml,
		);

		expect(result[0]).toEqual({
			title: defaultChatbotTitle,
			content: ["Test"],
			choiceOptions: [
				{
					text: defaultChoiceOptionText,
					link: "my link",
					isRandom: false,
					condition: "",
				},
			],
			keywords: [],
		});
	});

	it("handles choiceOption with anchor links", () => {
		const md = "## Test\nContenu\n1. [contenu du lien](#Lien-de-type-ancre)";
		const result = getChatbotInformations(
			md,
			{ chatbotTitle: "", initialMessage: "", indexEnd: 0 },
			yaml,
		);

		expect(result[1]).toEqual({
			title: "Test",
			content: ["Contenu"],
			choiceOptions: [
				{
					text: "contenu du lien",
					link: "Lien de type ancre",
					isRandom: false,
					condition: "",
				},
			],
			keywords: [],
		});
	});
});
