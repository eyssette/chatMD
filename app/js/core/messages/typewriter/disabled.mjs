import { yaml } from "../../../markdown/custom/yaml.mjs";

export function shouldDisableTypewriter() {
	return (
		window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
		yaml.typeWriter === false
	);
}
