export function showModal(html) {
	// Créer le fond de la modale
	const overlay = document.createElement("div");
	overlay.id = "systemModal";
	overlay.style.position = "fixed";
	overlay.style.top = 0;
	overlay.style.left = 0;
	overlay.style.width = "100vw";
	overlay.style.height = "100vh";
	overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
	overlay.style.display = "flex";
	overlay.style.alignItems = "center";
	overlay.style.justifyContent = "center";
	overlay.style.zIndex = 1000;

	// Créer la boîte modale
	const modal = document.createElement("div");
	modal.style.background = "#fff";
	modal.style.padding = "20px";
	modal.style.borderRadius = "8px";
	modal.style.position = "relative";
	modal.style.maxWidth = "450px";
	modal.style.maxHeight = "90vh";
	modal.style.overflow = "auto";

	// Ajouter la croix de fermeture
	const closeBtn = document.createElement("span");
	closeBtn.innerHTML = "&times;";
	closeBtn.style.position = "absolute";
	closeBtn.style.top = "10px";
	closeBtn.style.right = "15px";
	closeBtn.style.fontSize = "24px";
	closeBtn.style.cursor = "pointer";
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
