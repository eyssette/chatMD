export function showModal(html) {
	// Créer le fond de la modale
	const overlay = document.createElement("div");
	overlay.id = "systemModal";

	// Créer la boîte modale
	const modal = document.createElement("div");
	modal.classList.add("modal-content");

	// Ajouter la croix de fermeture
	const closeBtn = document.createElement("span");
	closeBtn.innerHTML = "&times;";
	closeBtn.classList.add("close-button");
	modal.appendChild(closeBtn);

	// Ajouter le contenu HTML
	const content = document.createElement("div");
	content.innerHTML = html;
	modal.appendChild(content);

	// Ajouter la modale à l'overlay
	overlay.appendChild(modal);
	document.body.appendChild(overlay);

	// Fonction de fermeture
	function closeModal() {
		document.body.removeChild(overlay);
	}

	// Fermer en cliquant sur la croix
	closeBtn.addEventListener("click", closeModal);

	// Fermer en cliquant en dehors de la modale
	overlay.addEventListener("click", (e) => {
		if (e.target === overlay) {
			closeModal();
		}
	});

	// Fermer en cliquant sur un bouton dans la modale
	modal.addEventListener("click", (e) => {
		if (e.target.tagName === "BUTTON") {
			closeModal();
		}
	});
}
