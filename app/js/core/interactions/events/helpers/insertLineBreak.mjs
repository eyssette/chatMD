// Pour insérer un retour à la ligne dans la zone de texte (quand on appuie sur Clic+Enter ou Alt+Enter)
export function insertLineBreak() {
	const selection = window.getSelection();
	if (!selection || selection.rangeCount === 0) return;

	const range = selection.getRangeAt(0);
	range.deleteContents();

	// Crée un <br> et un nœud vide après pour que le curseur ait une vraie position
	const br = document.createElement("br");
	const space = document.createTextNode("\u200B"); // zéro-width space

	range.insertNode(space);
	range.insertNode(br);

	// Place le curseur après l'espace
	range.setStartAfter(space);
	range.collapse(true);
	selection.removeAllRanges();
	selection.addRange(range);
}
