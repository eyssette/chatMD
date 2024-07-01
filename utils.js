// Pour tirer au hasard un élément dans un tableau
function getRandomElement(array) {
	return array[Math.floor(Math.random() * array.length)];
}

// Vérifie si une variable texte commence par un élément d'un tableau
function startsWithAnyOf(string,array) {
	for (const element of array) {
		if (string.startsWith(element)) {
		  return element;
		}
	}
}

// Pour gérer l'URL de la source du chatbot
function handleURL(url) {
	if (url !== "") {
		let addCorsProxy = true;
		// Vérification de la présence d'un raccourci
		const shortcut = shortcuts.find(element => element[0]==url);
		if (shortcut) {
			url = shortcut[1];
		}
		// Gestion des fichiers hébergés sur la forge et publiés sur une page web
		if(url.includes('.forge')) {
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
			(url.startsWith("https://codimd") || url.includes("hedgedoc") || url.includes("digipage") )
		) {
			addCorsProxy = false;
			url =
				url.replace("?edit", "").replace("?both", "").replace("?view", "").replace(/#$/,"").replace(/\/$/,'');
			url = url.indexOf("download") === -1 ? url + "/download" : url;
		}
		// gestion des fichiers hébergés sur framapad
		if (url.includes('framapad') && !url.endsWith('/export/txt')) {
			url = url.replace(/\?.*/,'') + '/export/txt';
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
		if(src.startsWith('<style>')) {
			styleElement = document.createElement("style");
			styleElement.textContent = src.replace('<style>','').replace('</style>','');
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



// Gestion des variables fixes : soit avant de parser le markdown, soit après
function processVariables(content, preprocess = false) {
	// Les variables fixes qui commencent par _ sont traitées avant de parser le contenu du Markdown
	const regex = preprocess ? /@{(_\S+)}/g : /@{(\S+)}/g
	return content.replaceAll(regex, function (match, variableName,positionMatch) {
		const positionLastMatch = content.lastIndexOf(match)
		if (yamlData && yamlData.variables && yamlData.variables[variableName]) {
			const variableValue = yamlData.variables[variableName];
			const variableValueSplit = variableValue.split("///");
			const variableValueChoice = getRandomElement(variableValueSplit);
			if(preprocess && positionMatch == positionLastMatch) {
				// Les variables fixes qui ont été traitées au tout début, avant de parser le contenu du Markdown, sont ensuite supprimés.
				delete yamlData.variables[variableName];
			}
			return variableValueChoice;
		} else {
			return "@{" + variableName + "}";
		}
	});
}


