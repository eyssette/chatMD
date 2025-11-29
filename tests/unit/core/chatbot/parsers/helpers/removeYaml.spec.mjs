import { removeYaml } from "../../../../../../app/js/core/chatbot/parsers/helpers/removeYaml.mjs";

describe("removeYaml", () => {
	it("removes YAML content before the first H1 title", () => {
		const mdWithYaml = `---
title: Sample Document
author: John Doe
---

# Introduction

This is the introduction section.

## Subsection

More content here.`;

		const expectedOutput = `# Introduction

This is the introduction section.

## Subsection

More content here.`;

		const result = removeYaml(mdWithYaml);
		expect(result).toBe(expectedOutput);
	});

	it("handles markdown without YAML", () => {
		const mdWithoutYaml = `# Title

Some content here.

## Subtitle

More content here.`;

		const result = removeYaml(mdWithoutYaml);
		expect(result).toBe(mdWithoutYaml);
	});

	it("handles markdown with only YAML", () => {
		const mdOnlyYaml = `---
avatar: bot.png
theme: sms
---
`;

		const expectedOutput = ``;

		const result = removeYaml(mdOnlyYaml);
		expect(result).toBe(expectedOutput);
	});

	it("handles markdown with no titles", () => {
		const mdNoTitles = `---
avatar: bot.png
theme: sms
---

This document has no titles, only content.`;

		const expectedOutput = `This document has no titles, only content.`;

		const result = removeYaml(mdNoTitles);
		expect(result).toBe(expectedOutput);
	});

	it("handles complex YAML structures", () => {
		const mdComplexYaml = `---
bots:
  bot1:
	 avatar: bot1.png
responsesTitle: ["## ", "### "]
useLLM:
	- url: https://api.example.com/llm
	- model: model
	- encryptedAPIkey: myKey
plugins: readcsv
---
# Chatbot Title

Initial message content.`;

		const expectedOutput = `# Chatbot Title

Initial message content.`;

		const result = removeYaml(mdComplexYaml);
		expect(result).toBe(expectedOutput);
	});

	it("handles yaml with --- in the content", () => {
		const mdYamlWithDashes = `---
useLLM:
  - url: https://api.example.com/
  - model: model
  - encryptedAPIkey: myKey
  - RAGseparator: "---"
---

# Main Title

Content starts here.`;

		const expectedOutput = `# Main Title

Content starts here.`;

		const result = removeYaml(mdYamlWithDashes);
		expect(result).toBe(expectedOutput);
	});

	it("handles markdown with empty lines before YAML", () => {
		const mdWithLeadingEmptyLines = `

---
keyboard: true
theme: sms
---

# Title After Empty Lines

Content goes here.`;

		const expectedOutput = `# Title After Empty Lines

Content goes here.`;

		const result = removeYaml(mdWithLeadingEmptyLines);
		expect(result).toBe(expectedOutput);
	});
	it("handles Markdown with unicode characters in YAML", () => {
		const mdWithUnicodeYaml = `---
footer: "unicode characters: ñ, ü, é, 漢"
---

# Test Title

Content test.`;

		const expectedOutput = `# Test Title

Content test.`;

		const result = removeYaml(mdWithUnicodeYaml);
		expect(result).toBe(expectedOutput);
	});

	it("handles Markdown with --- in markdown content", () => {
		const mdWithDashesInContent = `---
theme: sms
---

# Title

Content before dashes.

---

Content after dashes.`;

		const expectedOutput = `# Title

Content before dashes.

---

Content after dashes.`;

		const result = removeYaml(mdWithDashesInContent);
		expect(result).toBe(expectedOutput);
	});

	it("handles comments between YAML and markdown", () => {
		const mdWithComments = `---
theme: sms
---
<!-- This is a comment -->
# Title

Content goes here.`;

		const expectedOutput = `# Title

Content goes here.`;

		const result = removeYaml(mdWithComments);
		expect(result).toBe(expectedOutput);
	});

	it("handles Markdown with no YAML and no h1 title", () => {
		const mdNoYamlNoH1 = `This is some content without YAML or H1 title.

## Subtitle

More content here.`;

		const expectedOutput = `This is some content without YAML or H1 title.

## Subtitle

More content here.`;

		const result = removeYaml(mdNoYamlNoH1);
		expect(result).toBe(expectedOutput);
	});
});
