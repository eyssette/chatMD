import { yaml } from "../../../markdown/custom/yaml.mjs";
import { processDirectiveTypewriter } from "../../../markdown/custom/directives/typewriter.mjs";

export function shouldDisableTypewriter(md) {
	const disableTypewriter =
		window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
		yaml.typeWriter === false ||
		processDirectiveTypewriter(md).useTypewriter === false;
	md = disableTypewriter ? processDirectiveTypewriter(md).md : md;
	return { md: md, status: disableTypewriter };
}
