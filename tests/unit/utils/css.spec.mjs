import { scopeStyles } from "../../../app/js/utils/css.mjs";

describe("scopeStyles", () => {
	it("returns original string when no scoped style is present", () => {
		const input = "No styles here";
		expect(scopeStyles(input, ".msg")).toBe(input);
	});

	it("prefixes simple selectors inside scoped style", () => {
		const input = "<style scoped>.a { color: red; }</style>";
		const expected = "\\`\n<style>.msg .a {  color: red;  }</style>\n\\`";
		expect(scopeStyles(input, ".msg")).toBe(expected);
	});

	it("removes comments inside scoped style", () => {
		const input = "<style scoped>/* comment */ .a { color: red; }</style>";
		const expected = "\\`\n<style>.msg .a {  color: red;  }</style>\n\\`";
		expect(scopeStyles(input, ".msg")).toBe(expected);
	});

	it("handles @media queries inside scoped style", () => {
		const input =
			"<style scoped>@media (max-width: 600px) { .a { color: red; } }</style>";
		const expected =
			"\\`\n<style>@media (max-width: 600px) {.msg .a {  color: red;  } }</style>\n\\`";
		expect(scopeStyles(input, ".msg")).toBe(expected);
	});

	it("handles animations with @keyframes inside scoped style", () => {
		const input =
			"<style scoped>@keyframes slidein { from { transform: translateX(0%); } to { transform: translateX(100%); } } .a { animation: slidein 3s; }</style>";
		const expected =
			"\\`\n<style>@keyframes slidein {from {  transform: translateX(0%);  }to {  transform: translateX(100%);  } }.msg .a {  animation: slidein 3s;  }</style>\n\\`";
		expect(scopeStyles(input, ".msg")).toBe(expected);
	});

	it("handles animations with @keyframes and percentage selectors inside scoped style", () => {
		const input =
			"<style scoped>@keyframes fadein { 0% { opacity: 0; } 100% { opacity: 1; } } .a { animation: fadein 2s; }</style>";
		const expected =
			"\\`\n<style>@keyframes fadein {0% {  opacity: 0;  }100% {  opacity: 1;  } }.msg .a {  animation: fadein 2s;  }</style>\n\\`";
		expect(scopeStyles(input, ".msg")).toBe(expected);
	});

	it("does not double prefix if already present", () => {
		const input = "<style scoped>.msg .a { color: red; }</style>";
		const expected = "\\`\n<style>.msg .a {  color: red;  }</style>\n\\`";
		expect(scopeStyles(input, ".msg")).toBe(expected);
	});

	it("handles selector targeting the message itself", () => {
		const input =
			"<style scoped>.message { font-weight: bold; } .a { color: red; }</style>";
		const expected =
			"\\`\n<style>.msg.message {  font-weight: bold;  }.msg .a {  color: red;  }</style>\n\\`";
		expect(scopeStyles(input, ".msg")).toBe(expected);
	});
});
