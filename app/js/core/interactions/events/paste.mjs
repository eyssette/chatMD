import { userInput } from "../../../shared/selectors.mjs";
import { adjustFooterToInputHeight } from "./helpers/adjustFooterToInputHeight.mjs";

// On doit pouvoir ajuster la taille du footer quand on copie-colle un texte de plusieurs lignes dans la zone de textes (pour que le footer ne soit plus visible au-dessus de la zone de texte)
export function setPasteListener() {
	userInput.addEventListener("paste", () => {
		adjustFooterToInputHeight();
	});
}
