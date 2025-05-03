import { userInput } from "../../../shared/selectors.mjs";

export function setFocusListener() {
	userInput.focus({ preventScroll: true });

	userInput.addEventListener("focus", function () {
		this.classList.remove("placeholder");
	});

	userInput.addEventListener("blur", function () {
		this.classList.add("placeholder");
	});
}
