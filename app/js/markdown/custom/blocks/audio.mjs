// Gestion de l'audio
export function processAudio(message) {
	// Gestion des éléments audio autoplay
	message = message.replaceAll(
		/<audio[\s\S]*?src="([^"]+)"[\s\S]*?<\/audio>/gm,
		function (match, v1) {
			if (match.includes("autoplay")) {
				const audio = new Audio(v1);
				audio.play();
				if (match.includes("loop")) {
					audio.addEventListener("ended", () => {
						audio.currentTime = 0;
						audio.play();
					});
				}
				return `<!--${match}-->`;
			} else {
				return match;
			}
		},
	);
	// Gestion de l'audio avec la directive !Audio
	message = message.replaceAll(/!Audio:(.*)/g, function (match, v1) {
		const audio = new Audio(v1.trim());
		audio.play();
		return "";
	});

	return message;
}
