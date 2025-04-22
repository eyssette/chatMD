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

export const footerElement = document.getElementById("footer");

// Pour cacher le footer
export function hideFooter(userInput) {
	const controlsElement = document.getElementById("controls");
	footerElement.style.display = "none";
	controlsElement.style.height = "70px!important";
	const styleControls = userInput
		? "@media screen and (max-width: 500px) { #controls {height:110px!important}}"
		: "@media screen and (max-width: 500px) { #controls {height:70px!important}}";
	const styleSheet = document.createElement("style");
	styleSheet.innerText = styleControls;
	document.head.appendChild(styleSheet);
}
