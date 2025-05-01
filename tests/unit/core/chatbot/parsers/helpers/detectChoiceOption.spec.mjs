import { detectChoiceOption } from "../../../../../../app/js/core/chatbot/parsers/helpers/detectChoiceOption.mjs";

describe("detectChoiceOption", () => {
	it("detects ordered list line with a link starting with a dot (in Markdown), as a non-random choice option", () => {
		const result1 = detectChoiceOption("1. [text](link)");
		const result2 = detectChoiceOption("99. [text](link)");
		expect(result1.isChoice).toBeTrue();
		expect(result1.isRandom).toBeFalse();
		expect(result2.isChoice).toBeTrue();
		expect(result2.isRandom).toBeFalse();
	});

	it("detects ordered list line with a link, starting with a square bracket as a random choice option", () => {
		const result1 = detectChoiceOption("1) [text](link)");
		const result2 = detectChoiceOption("99) [text](link)");
		expect(result1.isChoice).toBeTrue();
		expect(result1.isRandom).toBeTrue();
		expect(result2.isChoice).toBeTrue();
		expect(result2.isRandom).toBeTrue();
	});

	it("detects ordered list line with a link as a choice option, if the text of the links contains whitespaces", () => {
		const result1 = detectChoiceOption("1) [text with whitespaces](link)");
		const result2 = detectChoiceOption("12. [ text ](link)");
		expect(result1.isChoice).toBeTrue();
		expect(result1.isRandom).toBeTrue();
		expect(result2.isChoice).toBeTrue();
		expect(result2.isRandom).toBeFalse();
	});

	it("detects ordered list line with a link as a choice option, even if there is no text in the link", () => {
		const result1 = detectChoiceOption("1) [text with whitespaces]()");
		const result2 = detectChoiceOption("12. [ text ]()");
		expect(result1.isChoice).toBeTrue();
		expect(result1.isRandom).toBeTrue();
		expect(result2.isChoice).toBeTrue();
		expect(result2.isRandom).toBeFalse();
	});

	it("detects ordered list line with a link as a choice option, even if the text or the link of the links contains non alphanumeric characters", () => {
		const result1 = detectChoiceOption("1) [text ! ? , ; .](link)");
		const result2 = detectChoiceOption("12. [text](text ! ? , ; .)");
		expect(result1.isChoice).toBeTrue();
		expect(result1.isRandom).toBeTrue();
		expect(result2.isChoice).toBeTrue();
		expect(result2.isRandom).toBeFalse();
	});

	it("detects ordered list line with a link as a choice option, even if there are whitespace characters in the link", () => {
		const result1 = detectChoiceOption("1) [text](link with whitespaces)");
		const result2 = detectChoiceOption("12. [text]( link )");
		expect(result1.isChoice).toBeTrue();
		expect(result1.isRandom).toBeTrue();
		expect(result2.isChoice).toBeTrue();
		expect(result2.isRandom).toBeFalse();
	});

	it("does not detect a list line with a link that does not respect the Markdown syntax of an ordered list as a choice option", () => {
		const result1 = detectChoiceOption(" 1. [text](link)");
		const result2 = detectChoiceOption("1.[text](link)");
		const result3 = detectChoiceOption("a. [text](link)");
		expect(result1.isChoice).toBeFalse();
		expect(result1.isRandom).toBeFalse();
		expect(result2.isChoice).toBeFalse();
		expect(result2.isRandom).toBeFalse();
		expect(result3.isChoice).toBeFalse();
		expect(result3.isRandom).toBeFalse();
	});

	it("does not detect a list line with a link as a choice option if there is some text after the link, unless it's just whitespace characters", () => {
		const result1 = detectChoiceOption("1. [text](link) text");
		const result2 = detectChoiceOption("1) [text](link) [text](link)");
		const result3 = detectChoiceOption("1. [text](link) ");
		const result4 = detectChoiceOption("1. [text](link))");
		expect(result1.isChoice).toBeFalse();
		expect(result1.isRandom).toBeFalse();
		expect(result2.isChoice).toBeFalse();
		expect(result2.isRandom).toBeFalse();
		expect(result3.isChoice).toBeTrue();
		expect(result3.isRandom).toBeFalse();
		expect(result4.isChoice).toBeFalse();
		expect(result4.isRandom).toBeFalse();
	});

	it("does not detect a list line with a link that does not respect the Markdown syntax of a link as a choice option", () => {
		const result1 = detectChoiceOption("1. (text)[link]");
		const result2 = detectChoiceOption("1. text(link)");
		const result3 = detectChoiceOption("1. [text]link");
		expect(result1.isChoice).toBeFalse();
		expect(result1.isRandom).toBeFalse();
		expect(result2.isChoice).toBeFalse();
		expect(result2.isRandom).toBeFalse();
		expect(result3.isChoice).toBeFalse();
		expect(result3.isRandom).toBeFalse();
	});

	it("does not detect a link which is not in an unordered list as a choice option", () => {
		const result1 = detectChoiceOption("- [text](link)");
		const result2 = detectChoiceOption("[text](link)");
		expect(result1.isChoice).toBeFalse();
		expect(result1.isRandom).toBeFalse();
		expect(result2.isChoice).toBeFalse();
		expect(result2.isRandom).toBeFalse();
	});

	it("does not detect text without a list and without a link as a choice option", () => {
		const result = detectChoiceOption("Just some text");
		expect(result.isChoice).toBeFalse();
		expect(result.isRandom).toBeFalse();
	});

	it("does not detect an ordered list with link to an external URL, as a choice option", () => {
		const result1 = detectChoiceOption("1. [text](https://example.com)");
		expect(result1.isChoice).toBeFalse();
		expect(result1.isRandom).toBeFalse();
		const result2 = detectChoiceOption("1. [text](mailto:my@email.com)");
		expect(result2.isChoice).toBeFalse();
		expect(result2.isRandom).toBeFalse();
		const result3 = detectChoiceOption("1. [text](tel:12312399R)");
		expect(result3.isChoice).toBeFalse();
		expect(result3.isRandom).toBeFalse();
	});
});
