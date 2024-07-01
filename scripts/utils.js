// Pour tirer au hasard un élément dans un tableau
function getRandomElement(array) {
	return array[Math.floor(Math.random() * array.length)];
}

// Vérifie si une variable texte commence par un élément d'un tableau
function startsWithAnyOf(string, array) {
	for (const element of array) {
		if (string.startsWith(element)) {
			return element;
		}
	}
}

// Une fonction pour ne garder que les éléments avec la valeur la plus grande dans un tableau
function topElements(array, maxElements) {
	let topElements;
	if (array.length < maxElements) {
		// Si le tableau contient moins que maxElements : on garde tout le tableau
		topElements = array.map((element, index) => [element, index]);
	} else {
		// Sinon, on garde seulement les éléments qui ont la valeur la plus grande
		topElements = array.reduce((acc, val, index) => {
			if (acc.length < maxElements) {
				acc.push([val, index]);
				acc.sort((a, b) => a[0] - b[0]);
			} else if (val > acc[0][0]) {
				acc[0] = [val, index];
				acc.sort((a, b) => a[0] - b[0]);
			}
			return acc;
		}, []);
	}
	// Trier par ordre décroissant
	topElements.sort((a, b) => b[0] - a[0]);

	return topElements;
}

// Une fonction pour réordonner de manière aléatoire un tableau
function shuffleArray(array) {
	return array.sort(function () {
		return Math.random() - 0.5;
	});
}

// Une fonction pour mettre de l'aléatoire dans un tableau, en conservant cependant la position de certains éléments
function randomizeArrayWithFixedElements(array) {
	let fixedElements = [];
	let randomizableElements = [];

	// On distingue les éléments fixes et les éléments à ordonner de manière aléatoire
	array.forEach(function (element) {
		if (!element[2]) {
			fixedElements.push(element);
		} else {
			randomizableElements.push(element);
		}
	});

	// On ordonne de manière aléatoire les éléments qui doivent l'être
	randomizableElements = shuffleArray(randomizableElements);

	// On reconstruit le tableau en réinsérant les éléments fixes au bon endroit
	var finalArray = [];
	array.forEach(function (element) {
		if (!element[2]) {
			finalArray.push(element);
		} else {
			finalArray.push(randomizableElements.shift());
		}
	});

	return finalArray;
}

// Une fonction pour tester si le tableau des options doit être réordonné avec de l'aléatoire
function shouldBeRandomized(array) {
	if (Array.isArray(array)) {
		for (let i = 0; i < array.length; i++) {
			if (array[i][2] === true) {
				return true;
			}
		}
	}
	return false;
}

// Pour gérer l'URL de la source du chatbot
function handleURL(url) {
	if (url !== "") {
		let addCorsProxy = true;
		// Vérification de la présence d'un raccourci
		const shortcut = shortcuts.find((element) => element[0] == url);
		if (shortcut) {
			url = shortcut[1];
		}
		// Gestion des fichiers hébergés sur la forge et publiés sur une page web
		if (url.includes(".forge")) {
			addCorsProxy = false;
		}
		// Gestion des fichiers hébergés sur github
		if (url.startsWith("https://github.com")) {
			addCorsProxy = false;
			url = url.replace(
				"https://github.com",
				"https://raw.githubusercontent.com"
			);
			url = url.replace("/blob/", "/");
		}
		// gestion des fichiers hébergés sur codiMD / hedgedoc / digipage
		if (
			url.startsWith("https://codimd") ||
			url.includes("hedgedoc") ||
			url.includes("digipage")
		) {
			addCorsProxy = false;
			url = url
				.replace("?edit", "")
				.replace("?both", "")
				.replace("?view", "")
				.replace(/#$/, "")
				.replace(/\/$/, "");
			url = url.indexOf("download") === -1 ? url + "/download" : url;
		}
		// gestion des fichiers hébergés sur framapad
		if (url.includes("framapad") && !url.endsWith("/export/txt")) {
			url = url.replace(/\?.*/, "") + "/export/txt";
		}
		url = addCorsProxy ? corsProxy + url : url;
	}
	return url;
}

// Pour charger des scripts
function loadScript(src) {
	return new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = src;
		script.onload = resolve;
		script.onerror = reject;
		document.head.appendChild(script);
	});
}

// Pour charger des CSS
function loadCSS(src) {
	return new Promise((resolve, reject) => {
		let styleElement;
		if (src.startsWith("<style>")) {
			styleElement = document.createElement("style");
			styleElement.textContent = src
				.replace("<style>", "")
				.replace("</style>", "");
		} else {
			styleElement = document.createElement("link");
			styleElement.href = src;
			styleElement.rel = "stylesheet";
			styleElement.onload = resolve;
			styleElement.onerror = reject;
		}
		document.head.appendChild(styleElement);
	});
}

// Gestion du scroll automatique vers le bas
function scrollWindow() {
	setTimeout(() => {
		window.scrollTo(0, document.body.scrollHeight);
	}, 100);
}

function hideFooter() {
	const footerElement = document.getElementById("footer");
	const controlsElement = document.getElementById("controls");
	footerElement.style.display = "none";
	controlsElement.style.height = "70px";
	const styleControls =
		"@media screen and (max-width: 500px) { #controls {height:110px!important}}";
	const styleSheet = document.createElement("style");
	styleSheet.innerText = styleControls;
	document.head.appendChild(styleSheet);
}