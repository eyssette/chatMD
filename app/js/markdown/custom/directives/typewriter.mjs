export function processDirectiveTypewriter(md) {
	const match = md.match(/!Typewriter\s*:\s*(true|false)/i);
	if (match) {
		return {
			md: md.replace(match[0], ""),
			useTypewriter: match[1].toLowerCase() === "true",
		};
	}
	return { md: md, useTypewriter: undefined };
}
