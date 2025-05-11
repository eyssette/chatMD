import { yaml } from "../../../../markdown/custom/yaml.mjs";

export function processLightbox() {
	if (yaml && yaml.plugins && yaml.plugins.includes("lightbox")) {
		const interval = setInterval(() => {
			if (window.lightbox) {
				clearInterval(interval);
				window.lightbox();
			}
		}, 500);
	}
}
