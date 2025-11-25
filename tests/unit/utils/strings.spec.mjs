import {
	sanitizeHtml,
	tryConvertStringToNumber,
	startsWithAnyOf,
	hasSentenceEndMark,
	chunkWithBackticks,
	splitHtmlIntoChunks,
	encodeString,
	decodeString,
	obfuscateString,
	deobfuscateString,
	endsWithUnclosedHtmlTag,
} from "../../../app/js/utils/strings.mjs";

describe("sanitizeHtml", () => {
	it("keeps only the allowed HTML tags and removes all others", () => {
		const allowedTags = ["<p>", "</p>"];
		const input = "<p><a>test</a></p>";
		const output = sanitizeHtml(input, allowedTags);
		expect(output).toBe("<p>test</p>");
	});

	it("keeps only the allowed HTML tags and attributes and removes all others", () => {
		const allowedTags = ['<p class="myClass">', "</p>"];
		const input = '<p class="myClass"><a>test</a></p>';
		const output = sanitizeHtml(input, allowedTags);
		expect(output).toBe('<p class="myClass">test</p>');
	});

	it("removes all HTML tags if none are allowed", () => {
		const allowedTags = [];
		const input = "<div><strong>Text</strong></div>";
		const output = sanitizeHtml(input, allowedTags);
		expect(output).toBe("Text");
	});

	it("preserves allowed tags even if they are nested", () => {
		const allowedTags = ["<b>", "</b>", "<i>", "</i>"];
		const input = "<b><i>text</i></b><u>test</u>";
		const output = sanitizeHtml(input, allowedTags);
		expect(output).toBe("<b><i>text</i></b>test");
	});

	it("preserves allowed tags even if they are used more than once", () => {
		const allowedTags = ["<b>", "</b>", "<i>", "</i>"];
		const input = "<b>bold1</b><i>italics1</i> <b>bold2</b><i>italics2</i>";
		const output = sanitizeHtml(input, allowedTags);
		expect(output).toBe(
			"<b>bold1</b><i>italics1</i> <b>bold2</b><i>italics2</i>",
		);
	});

	it("returns plain text if the string contains no allowed tags", () => {
		const allowedTags = ["<p>", "</p>"];
		const input = "<div><span>hello</span></div>";
		const output = sanitizeHtml(input, allowedTags);
		expect(output).toBe("hello");
	});
});

describe("startsWithAnyOf", () => {
	it("returns the first element from an array that is present at the beginning of a string", () => {
		const result = startsWithAnyOf("coucou ça va ?", [
			"hello",
			"bonjour",
			"courage !",
			"coucou",
		]);
		expect(result).toBe("coucou");
	});

	it("does not return an element of an array if that element is not at the beginning of the string", () => {
		const result = startsWithAnyOf("coucou ça va ?", [
			"hello",
			"bonjour",
			"courage !",
			"coucou",
		]);
		expect(result).not.toBe("bonjour !");
	});

	it("does not return an element of an array if that element includes the string but is longer than the string", () => {
		const result = startsWithAnyOf("coucou ça va ?", [
			"hello",
			"bonjour",
			"courage !",
			"coucou",
			"coucou ça va bien ?",
		]);
		expect(result).not.toBe("coucou ça va bien ?");
	});

	it("returns undefined if no match is found", () => {
		const result = startsWithAnyOf("salut !", [
			"hello",
			"bonjour",
			"courage !",
			"coucou",
		]);
		expect(result).toBeUndefined();
	});

	it("returns the first element from an array that is present at the beginning of a string, in order even if there are other matching elements", () => {
		const result = startsWithAnyOf("bonjour tout le monde", [
			"bonjour",
			"bonjour tout le monde",
			"bon",
		]);
		expect(result).toBe("bonjour");
	});
});

describe("tryConvertStringToNumber", () => {
	it("converts a numeric string to a number", () => {
		const result = tryConvertStringToNumber("10");
		expect(result).toBeInstanceOf(Number);
		expect(result).toBe(10);
	});

	it("handles decimal numbers", () => {
		const result = tryConvertStringToNumber("3.14");
		expect(result).toBe(3.14);
	});

	it("handles negative numbers", () => {
		const result = tryConvertStringToNumber("-3.14");
		expect(result).toBe(-3.14);
	});

	it("handles a string which mixes numbers with letters", () => {
		const result = tryConvertStringToNumber("123abc");
		expect(result).toBe("123abc");
	});

	it("does not convert to number if the string starts with 0", () => {
		const result = tryConvertStringToNumber("007");
		expect(result).not.toBe(7);
	});

	it("does not convert negative numbers writen in French", () => {
		const result = tryConvertStringToNumber("-3,14");
		expect(result).not.toBe(-3.14);
	});

	it("returns the original string when it represents a hexadecimal number", () => {
		const result = tryConvertStringToNumber("BBC");
		expect(result).toBe("BBC");
	});

	it("returns the initial string for non-numeric strings", () => {
		const result = tryConvertStringToNumber("hello");
		expect(result).toBe("hello");
	});

	it("returns an empty string if the initial string is empty", () => {
		const result = tryConvertStringToNumber("");
		expect(result).toBe("");
	});

	it("returns the argument if the argument is not a string", () => {
		const object = { test: "test" };
		const result = tryConvertStringToNumber(object);
		expect(result).toBe(object);
	});

	it("returns undefined if the argument is undefined", () => {
		const result = tryConvertStringToNumber(undefined);
		expect(result).toBe(undefined);
	});
});

describe("hasSentenceEndMark", () => {
	it("returns true when the string ends with a period", () => {
		expect(hasSentenceEndMark("Hello.")).toBe(true);
	});

	it("returns true when the string ends with an exclamation mark", () => {
		expect(hasSentenceEndMark("Wow !")).toBe(true);
	});

	it("returns true when the string ends with a question mark", () => {
		expect(hasSentenceEndMark("Really ?")).toBe(true);
	});

	it("returns true when the string ends with an ellipsis character (…) ", () => {
		expect(hasSentenceEndMark("To be continued…")).toBe(true);
	});

	it("returns true when the string ends with the end of a HTML tag mark >", () => {
		expect(hasSentenceEndMark("<code>Test</code>")).toBe(true);
	});

	it("returns false when the string ends with a semicolon", () => {
		expect(hasSentenceEndMark("Wait here;")).toBe(false);
	});

	it("returns false when the string ends with a comma", () => {
		expect(hasSentenceEndMark("Hello,")).toBe(false);
	});

	it("returns false when the string has no sentence-ending punctuation", () => {
		expect(hasSentenceEndMark("Hello there")).toBe(false);
	});

	it("returns false when the string has no sentence-ending punctuation at the end of the string", () => {
		expect(hasSentenceEndMark("Hello. How are you ? Fine ! Well")).toBe(false);
	});

	it("returns false for an empty string", () => {
		expect(hasSentenceEndMark("")).toBe(false);
	});

	it("ignores trailing whitespace", () => {
		expect(hasSentenceEndMark("Hi !   ")).toBe(true);
		expect(hasSentenceEndMark("Hello   ")).toBe(false);
	});
});

describe("chunkWithBackticks", () => {
	it("wraps text in backticks every chunkSize characters", () => {
		const result = chunkWithBackticks("HelloWorld", 5);
		expect(result).toBe("`Hello``World`");
	});

	it("wraps text correctly when length is not divisible by chunkSize", () => {
		const result = chunkWithBackticks("HelloWorld!", 5);
		expect(result).toBe("`Hello``World``!`");
	});

	it("returns an empty string when input is empty", () => {
		const result = chunkWithBackticks("", 5);
		expect(result).toBe("");
	});

	it("wraps the entire text when chunkSize is greater than text length", () => {
		const result = chunkWithBackticks("Hi", 10);
		expect(result).toBe("`Hi`");
	});

	it("wraps every character individually when chunkSize is 1", () => {
		const result = chunkWithBackticks("ABC", 1);
		expect(result).toBe("`A``B``C`");
	});

	it("handles special characters correctly", () => {
		const result = chunkWithBackticks("A&B<C>", 2);
		expect(result).toBe("`A&``B<``C>`");
	});
});

describe("splitHtmlIntoChunks", () => {
	it("splits plain text into chunks of specified size", () => {
		const html = "<p>HelloWorld</p>";
		const result = splitHtmlIntoChunks(html, 5);
		expect(result).toBe("<p>`Hello``World`</p>");
	});

	it("preserves text inside backticks without modification", () => {
		const html = "<p>`HelloWorld`</p>";
		const result = splitHtmlIntoChunks(html, 5);
		expect(result).toBe("<p>`HelloWorld`</p>");
	});

	it("does not split pause markers inside HTML tags", () => {
		const html = "<p>^1000</p>";
		const result = splitHtmlIntoChunks(html, 5);
		expect(result).toBe("<p>^1000</p>");
	});

	it("handles multiple HTML elements correctly", () => {
		const html = "<div>HelloWorld</div><span>TestText</span>";
		const result = splitHtmlIntoChunks(html, 4);
		expect(result).toBe("<div>`Hell``oWor``ld`</div><span>`Test``Text`</span>");
	});

	it("handles single tags HTML element correctly", () => {
		const html = `<div>Hello <br />World<img src="test"/></div><span><img src="test"/></span>`;
		const result = splitHtmlIntoChunks(html, 4);
		expect(result).toBe(
			`<div>\`Hell\`\`o \`<br />\`Worl\`\`d\`<img src="test"/></div><span><img src="test"/></span>`,
		);
	});

	it("ignores empty text between HTML tags", () => {
		const html = "<div></div>";
		const result = splitHtmlIntoChunks(html, 4);
		expect(result).toBe("<div></div>");
	});

	it("splits complex mixed content correctly", () => {
		const html = "<div>Start`ProtectedText`End</div>";
		// ajouter : const html = "<div>Start`ProtectedText`End<img src="test"/>Test</div>";
		const result = splitHtmlIntoChunks(html, 5);
		expect(result).toBe("<div>`Start``ProtectedText``End`</div>");
	});
});

describe("encodeString", () => {
	it("returns a Base64-encoded URI component for a regular string", () => {
		const input = "Hello, world!";
		const result = encodeString(input);
		const expected = window.btoa(encodeURIComponent(input));
		expect(result).toEqual(expected);
	});

	it("correctly encodes special characters", () => {
		const input = "éà&%$";
		const result = encodeString(input);
		const expected = window.btoa(encodeURIComponent(input));
		expect(result).toEqual(expected);
	});

	it("produces a string that can be decoded back to the original", () => {
		const input = "Test string with spaces and !@#";
		const encoded = encodeString(input);
		const decoded = decodeString(encoded);
		expect(decoded).toEqual(input);
	});
});

describe("decodeString", () => {
	it("returns the original string from a valid encoded input", () => {
		const input = "Hello, encode-decode!";
		const encoded = encodeString(input);
		const result = decodeString(encoded);
		expect(result).toEqual(input);
	});

	it("handles decoding of special characters", () => {
		const input = "çñøß€";
		const encoded = encodeString(input);
		const result = decodeString(encoded);
		expect(result).toEqual(input);
	});

	it("throws an error for invalid Base64 input", () => {
		const invalidInput = "not_base64!!!";
		expect(() => decodeString(invalidInput)).toThrow();
	});
});

describe("obfuscateString", () => {
	it("obfuscates a string correctly", () => {
		const input = "This is a test string with unicode: éàçñøß€";
		const result = obfuscateString(input);
		expect(result).toBe(
			"VGhpcyBpcyBhIHRlc3Qgc3RyaW5nIHdpdGggdW5pY29kZTogw6nDoMOnw7HDuMOf4oKs",
		);
	});
});

describe("deobfuscateString", () => {
	it("deobfuscates an obfuscated string correctly", () => {
		const input =
			"VGhpcyBpcyBhIHRlc3Qgc3RyaW5nIHdpdGggdW5pY29kZTogw6nDoMOnw7HDuMOf4oKs";
		const result = deobfuscateString(input);
		expect(result).toEqual("This is a test string with unicode: éàçñøß€");
	});
});

describe("endsWithUnclosedHtmlTag", () => {
	it("returns true for a string ending with an unclosed HTML tag", () => {
		const input = "This is a <div>test";
		const result = endsWithUnclosedHtmlTag(input);
		expect(result).toBe(true);
	});

	it("returns false for a string ending with a closed HTML tag", () => {
		const input = "This is a <div>test</div>";
		const result = endsWithUnclosedHtmlTag(input);
		expect(result).toBe(false);
	});

	it("returns true for a string ending with an unclosed HTML tag with attributes", () => {
		const input = 'This is a <div style="display:none">test';
		const result = endsWithUnclosedHtmlTag(input);
		expect(result).toBe(true);
	});

	it("returns false for a string ending with a closed HTML tag with attributes", () => {
		const input = 'This is a <div style="display:none">test</div>';
		const result = endsWithUnclosedHtmlTag(input);
		expect(result).toBe(false);
	});

	it("returns false for a string with no HTML tags", () => {
		const input = "This is a test string.";
		const result = endsWithUnclosedHtmlTag(input);
		expect(result).toBe(false);
	});

	it("returns false for self-closing tags", () => {
		const input = ["This is a test <br>", "This is a test <hr>"];
		input.forEach((str) => {
			const result = endsWithUnclosedHtmlTag(str);
			expect(result).toBe(false);
		});
	});

	it("returns false for closing tags", () => {
		const input = "This is a test </div>";
		const result = endsWithUnclosedHtmlTag(input);
		expect(result).toBe(false);
	});
});
