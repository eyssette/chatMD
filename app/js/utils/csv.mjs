// Attend que la librairie Papa.parse soit disponible
function waitForPapaParse() {
	return new Promise((resolve) => {
		if (window.Papa) {
			resolve();
			return;
		}

		const checkInterval = setInterval(() => {
			if (window.Papa) {
				clearInterval(checkInterval);
				resolve();
			}
		}, 500);

		// Timeout de sécurité (10 secondes)
		setTimeout(() => {
			clearInterval(checkInterval);
			if (!window.Papa) {
				throw new Error("Papa Parse n'a pas pu être chargé");
			}
		}, 10000);
	});
}

// Vérifie si les données sont du JSON
function isJsonData(data) {
	const trimmed = data.trim();
	return trimmed.startsWith("{") || trimmed.startsWith("[");
}

// Traite les données avec PapaParse
function parseWithPapa(data, options = {}) {
	return new Promise((resolve, reject) => {
		window.Papa.parse(data, {
			skipEmptyLines: true,
			...options,
			complete: (results) => resolve(results),
			error: (error) => reject(error),
		});
	});
}

// Pour parser les données si elles sont en JSON
function parseJsonData(data) {
	const jsonData = JSON.parse(data);
	const dataArray = jsonData.results || jsonData;
	const csv = window.Papa.unparse(dataArray);
	return parseWithPapa(csv);
}

// Pour parser les données si elles sont en CSV
function parseCsvData(data, options) {
	return parseWithPapa(data, options);
}

export async function parseCsv(url, options = {}) {
	// On attend que papaparse soit disponible
	await waitForPapaParse();
	try {
		// On télécharge le contenu
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Erreur HTTP: ${response.status}`);
		}

		const data = await response.text();

		// Si c'est du JSON
		if (isJsonData(data)) {
			return await parseJsonData(data);
		}

		// Si c'est du CSV/TSV
		if (url.endsWith(".tsv")) {
			// Pour les TSV, on utilise la tabulation comme délimiteur, sauf si spécifié autrement dans les options
			options.delimiter = options.delimiter ? options.delimiter : "\t";
		}

		return await parseCsvData(data, options);
	} catch (error) {
		console.error("Erreur lors du parsing:", error);
		return null;
	}
}
