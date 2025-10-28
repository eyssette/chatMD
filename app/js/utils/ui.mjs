// Gestion du scroll automatique vers le bas
function scrollToBottomOfPage(behavior) {
	const heightPage =
		Math.max(
			document.body.scrollHeight,
			document.documentElement.scrollHeight,
		) + 150;
	window.scrollTo({
		top: heightPage,
		behavior: behavior,
	});
}

let animationFrameId = null;
export function scrollWindow(option) {
	const isSmooth = option && option.scrollMode == "smooth";
	if (animationFrameId !== null) {
		window.cancelAnimationFrame(animationFrameId);
		animationFrameId = null;
	}

	if (isSmooth) {
		animationFrameId = window.requestAnimationFrame(() => {
			scrollToBottomOfPage("smooth");
			animationFrameId = null;
		});
	} else {
		scrollToBottomOfPage("auto");
	}
}

// Pour définir le contenu du footer
export function setContentOfFooter(footerElement, html) {
	footerElement.innerHTML = html;
}
