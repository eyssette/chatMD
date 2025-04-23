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

// Pour redimensionner le footer sur des petits écrans
function resizeFooterForSmallScreenToSpecificHeight(CSSheight) {
	const style = document.createElement("style");
	style.id = "styleControlsIfNoFooter";
	style.textContent = `
		@media screen and (max-width: 500px) {
			#controls {
				height: ${CSSheight}!important;
			}
		}
	`;
	document.head.appendChild(style);
}

// Pour cacher le footer
export function hideFooter(isUserInputVisible) {
	const controlsElement = document.getElementById("controls");
	const footerElement = document.getElementById("footer");

	footerElement.style.display = "none";
	controlsElement.style.height = "70px";

	const smallScreenFooterHeight = isUserInputVisible ? "110px" : "50px";
	resizeFooterForSmallScreenToSpecificHeight(smallScreenFooterHeight);
}

// Pour définir le contenu du footer
export function setContentOfFooter(html) {
	const footerElement = document.getElementById("footer");
	footerElement.innerHTML = html;
}
