// Pour tirer au hasard un élément dans un tableau
export function getRandomElement(array) {
	return array[Math.floor(Math.random() * array.length)];
}

// Pour ne garder que les éléments avec la valeur la plus grande dans un tableau
export function topElements(array, maxElements) {
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

// Pour réordonner de manière aléatoire un tableau
export function shuffleArray(array) {
	return array.sort(function () {
		return Math.random() - 0.5;
	});
}

// Pour mettre de l'aléatoire dans un tableau, en conservant cependant la position de certains éléments
export function randomizeArrayWithFixedElements(array) {
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

// Pour tester si le tableau des options doit être réordonné avec de l'aléatoire
export function shouldBeRandomized(array) {
	if (Array.isArray(array)) {
		const arrayLength = array.length;
		for (let i = 0; i < arrayLength; i++) {
			if (array[i][2] === true) {
				return true;
			}
		}
	}
	return false;
}
