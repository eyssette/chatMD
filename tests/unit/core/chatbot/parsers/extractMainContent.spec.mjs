import { getMainContentInformations } from "../../../../../app/js/core/chatbot/parsers/extractMainContent.mjs";

describe("getMainContentInformations", () => {
	let yaml = {
		responsesTitles: ["## ", "### "],
		dynamicContent: true,
		obfuscate: false,
	};

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
		const result = getMainContentInformations(markdown, 11, yaml);

		expect(result.length).toBe(1);
		expect(result[0][0]).toBe("First title");
		expect(result[0][1]).toEqual(["keyword 1", "keyword 2"]);
		expect(result[0][2]).toEqual([
			"Some content",
			"on multiples lines",
			"1. With markup",
			"- in Markdown",
		]);
		expect(result[0][3]).toEqual([
			["Option 1", "link 1", false, ""],
			["Option 2", "link 2", true, ""],
		]);
	});

	it("splits multiple H2 response sections correctly", () => {
		const markdown = `Intro text
## First
- item A
Some content A
## Second
Some content B`;
		const result = getMainContentInformations(markdown, 11, yaml);

		expect(result.length).toBe(2);
		expect(result[0][0]).toBe("First");
		expect(result[0][1]).toEqual(["item A"]);
		expect(result[1][0]).toBe("Second");
		expect(result[1][1]).toEqual([]);
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

		const result = getMainContentInformations(markdown, 0, yamlWithObfuscation);

		const [text1, link1, random1, condition1] = result[0][3][0];
		const [text2, link2, random2, condition2] = result[0][3][1];

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
		const result = getMainContentInformations(markdown, 0, yaml);

		expect(result[0][2][0]).toBe(
			'See <a href="#section-one">section one</a> and <a href="#Section two">section two</a>.',
		);
	});

	it("does not consider as part of the content of a section a line that marks the structure of the chabot by using headers whose level is inferior to the level that are used to mark the possible answers of the chatbot ", () => {
		const markdown1 = `### Response Title
Some informative text here.
# This is an H1 title
## Test
Another line of text.`;
		const result1 = getMainContentInformations(markdown1, 0, yaml);

		expect(result1[0][2]).toEqual(["Some informative text here."]);
		expect(result1[0][2]).not.toContain("This is an H1 title");

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
		const result2 = getMainContentInformations(markdown2, 0, yaml2);

		expect(result2[0][2]).toEqual(["Some informative text here."]);
		expect(result2[0][2]).not.toContain("This is an H2 title");

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
		const result3 = getMainContentInformations(markdown3, 0, yaml3);

		expect(result3[0][2]).toEqual(["Some informative text here."]);
		expect(result3[0][2]).not.toContain("This is an H3 title");
	});
});
