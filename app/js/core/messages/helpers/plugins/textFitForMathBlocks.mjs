import { yaml } from "../../../../markdown/custom/yaml.mjs";
import { chatContainer } from "../../../../shared/selectors.mjs";

export function textFitForMathBlocks(messageElement) {
	// Gestion de textFit pour les éléments en Latex
	if (yaml && yaml.plugins && yaml.plugins.includes("textFit")) {
		const mathBlocks = Array.from(
			messageElement.querySelectorAll(".katex-display"),
		);
		const overflowingMathBlocks = mathBlocks.filter((el) => {
			return el.scrollWidth > chatContainer.clientWidth;
		});
		window.textFit(overflowingMathBlocks, {
			widthOnly: true,
			minFontSize: 11,
		});
	}
}
