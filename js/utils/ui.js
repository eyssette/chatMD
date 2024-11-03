// Gestion du scroll automatique vers le bas
export function scrollWindow(isSmooth) {
	if (isSmooth) {
		window.requestAnimationFrame(() => {
			window.scrollTo({
				top: document.body.scrollHeight,
				behavior: "smooth",
			});
		});
	} else {
		window.scrollTo({
			top: document.body.scrollHeight,
			behavior: "auto",
		});
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
