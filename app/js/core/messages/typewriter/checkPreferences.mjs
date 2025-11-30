import { yaml } from "../../../markdown/custom/yaml.mjs";
import { processDirectiveTypewriter } from "../../../markdown/custom/directives/typewriter.mjs";

export function checkTypewriterPreferences(md) {
	const directiveTypewriter = processDirectiveTypewriter(md);
	md = directiveTypewriter.md;

	const noTypewriter =
		!window.matchMedia ||
		window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
		(yaml.typeWriter === false && directiveTypewriter.useTypewriter !== true) ||
		(yaml.typeWriter === true && directiveTypewriter.useTypewriter === false);

	return { md: md, useTypewriter: !noTypewriter };
}
