// eslint-disable-next-line no-unused-vars
function lightbox() {
	// On sélectionne toutes les images sauf les images dont l'URL finit par ?nolightbox
	const images = document.querySelectorAll(
		"img[src]:not([src$='?nolightbox'])",
	);
	// On sélectionne tous les liens qui vont vers des PDFs
	const pdfLinks = document.querySelectorAll("a[href$='.pdf']");

	// On sélectionne tous les autres liens
	const iframeLinks = document.querySelectorAll("a[href]:not([href$='.pdf'])");

	// Crée et configure le conteneur lightbox
	const lightboxContainer = document.createElement("div");
	lightboxContainer.id = "lightbox";
	lightboxContainer.style.position = "fixed";
	lightboxContainer.style.top = "0";
	lightboxContainer.style.left = "0";
	lightboxContainer.style.width = "100%";
	lightboxContainer.style.height = "100%";
	lightboxContainer.style.backgroundColor = "rgba(0,0,0,0.85)";
	lightboxContainer.style.display = "none";
	lightboxContainer.style.justifyContent = "center";
	lightboxContainer.style.alignItems = "center";
	lightboxContainer.style.zIndex = "1000";

	// Crée un conteneur pour l'image ou le PDF
	const lightboxContent = document.createElement("div");
	if (window.screen.width < 500) {
		lightboxContent.style.width = "100%";
		lightboxContent.style.height = "100%";
	} else {
		lightboxContent.style.width = "80%";
		lightboxContent.style.height = "90%";
		lightboxContent.style.border = "10px solid black";
		lightboxContent.style.borderRadius = "20px";
	}
	lightboxContent.style.backgroundColor = "white";
	lightboxContent.style.display = "flex";
	lightboxContent.style.justifyContent = "center";
	lightboxContent.style.alignItems = "center";

	// Crée un élément <img> pour afficher les images
	const lightboxImage = document.createElement("img");
	lightboxImage.style.maxWidth = "100%";
	lightboxImage.style.width = "100%";
	lightboxImage.style.maxHeight = "100%";
	lightboxImage.style.objectFit = "contain";

	// Crée un élément <embed> pour afficher les PDFs
	const lightboxPDF = document.createElement("embed");
	lightboxPDF.style.width = "90%";
	lightboxPDF.style.height = "90%";
	lightboxPDF.style.border = "none";
	lightboxPDF.setAttribute("type", "application/pdf");
	lightboxPDF.setAttribute("allow", "fullscreen");

	// Crée un élément <iframe> pour les autres liens
	const lightboxIframe = document.createElement("iframe");
	lightboxIframe.style.width = "90%";
	lightboxIframe.style.height = "90%";
	lightboxIframe.style.maxHeight = "none";
	lightboxIframe.style.border = "none";
	lightboxIframe.style.display = "none";

	// Ajoute le conteneur pour l'image ou le PDF ou l'iframe
	lightboxContent.appendChild(lightboxImage);
	lightboxContent.appendChild(lightboxPDF);
	lightboxContent.appendChild(lightboxIframe);
	lightboxContainer.appendChild(lightboxContent);

	// Crée la croix de fermeture
	const closeButton = document.createElement("span");
	closeButton.innerHTML = "&times;";
	closeButton.style.position = "absolute";
	if (window.screen.width < 500) {
		closeButton.style.top = "10px";
		closeButton.style.right = "10px";
		closeButton.style.color = "black";
	} else {
		closeButton.style.top = "20px";
		closeButton.style.right = "15px";
		closeButton.style.color = "white";
	}
	closeButton.style.fontSize = "80px";
	closeButton.style.cursor = "pointer";

	// Ajoute la croix de fermeture au conteneur
	lightboxContainer.appendChild(closeButton);
	document.body.appendChild(lightboxContainer);

	// Ouverture de la lightbox
	function openLightbox() {
		lightboxContainer.style.display = "flex";
		lightboxContainer.classList.add("lightbox-open");
		lightboxContainer.classList.remove("lightbox-closed");
		lightboxImage.addEventListener("click", () => {
			closeLightbox();
		});
	}

	// Fermeture de la lightbox
	function closeLightbox() {
		lightboxContainer.style.display = "none";
		lightboxImage.style.display = "none";
		lightboxPDF.style.display = "none";
		lightboxIframe.style.display = "none";
		lightboxImage.src = "";
		lightboxPDF.src = "";
		lightboxIframe.src = "";
		lightboxContainer.classList.add("lightbox-closed");
		lightboxContainer.classList.remove("lightbox-open");
	}

	// Ferme la lightbox si on clique dessus
	lightboxContainer.addEventListener("click", (e) => {
		if (e.target === lightboxContainer || e.target === closeButton) {
			closeLightbox();
		}
	});

	// Ferme la lightbox dès qu'on appuie sur le clavier
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape") {
			closeLightbox();
		}
	});

	// Ouverture de la lightbox quand on clique sur une image sauf si l'image elle-même renvoie vers un lien
	images.forEach((image) => {
		image.addEventListener("click", () => {
			const parentElementTagName = image.parentElement.tagName;
			const isImageWithLink = parentElementTagName == "A";
			if (!isImageWithLink) {
				image.classList.add("lightboxAddOn");
				lightboxImage.src = image.src;
				lightboxImage.style.height = `${image.naturalHeight * 3}px`;
				lightboxImage.style.display = "block";
				lightboxPDF.style.display = "none";
				lightboxIframe.style.display = "none";
				openLightbox();
			}
		});
	});

	// Ouverture de la lightbox quand on clique sur un lien vers un PDF
	pdfLinks.forEach((link) => {
		link.classList.add("lightboxAddOn");
		link.addEventListener("click", (e) => {
			e.preventDefault();
			lightboxPDF.src = link.href;
			lightboxPDF.style.display = "block";
			lightboxImage.style.display = "none";
			lightboxIframe.style.display = "none";
			openLightbox();
		});
	});

	// Ouverture de la lightbox quand on clique sur un lien qui est dans un élément qui a pour classe iframe
	iframeLinks.forEach((link) => {
		link.addEventListener("click", (e) => {
			const parentElement = link.parentElement;
			const useIframe =
				parentElement.classList.contains("iframe") ||
				parentElement.parentElement.classList.contains("iframe");
			if (useIframe) {
				const href = link.getAttribute("href");
				e.preventDefault();
				lightboxIframe.src = href;
				lightboxIframe.style.display = "block";
				lightboxImage.style.display = "none";
				lightboxPDF.style.display = "none";
				openLightbox();
			}
		});
	});
}
