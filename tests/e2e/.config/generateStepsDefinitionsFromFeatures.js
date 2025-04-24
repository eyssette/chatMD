const path = require("path");
const fs = require("fs");
const { spawnSync } = require("child_process");

// Vérifie si un fichier de Steps existe déjà
function fileExists(file) {
	return fs.existsSync(file);
}

function getFeatureFilesRecursively(dirPath) {
	let featureFiles = [];

	// Lire les fichiers et les répertoires dans le dossier courant
	const files = fs.readdirSync(dirPath);

	files.forEach((file) => {
		const fullPath = path.join(dirPath, file);

		// Vérifier si c'est un répertoire
		if (fs.statSync(fullPath).isDirectory()) {
			// Si c'est un répertoire, appeler la fonction récursive pour l'explorer
			featureFiles = featureFiles.concat(getFeatureFilesRecursively(fullPath));
		} else if (file.endsWith(".feature")) {
			// Si c'est un fichier .feature, l'ajouter à la liste
			featureFiles.push(fullPath);
		}
	});

	return featureFiles;
}

const featureFiles = getFeatureFilesRecursively("./features");

featureFiles.forEach((file) => {
	const stepFile = file
		.replace(".feature", ".js")
		.replace("features/", "tests/e2e/step_definitions/");
	try {
		if (!fileExists(stepFile)) {
			const resultFromCommand = spawnSync(
				"npx",
				[
					"codeceptjs",
					"gherkin:snippets",
					"--path=tests/e2e/step_definitions/",
					`--feature=${file}`,
				],
				{ encoding: "utf-8" },
			);

			const output = resultFromCommand.stdout;

			// Trouver la section entre "Snippets generated" et "Snippets added"
			const startIndex = output.indexOf("Snippets generated");
			const endIndex = output.indexOf("Snippets added");

			// Vérifier que les indices sont valides
			if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
				const filteredOutput = output.slice(startIndex, endIndex);

				// Remplacer les chaînes spécifiques dans la sortie
				const transformedOutput = filteredOutput
					.replace(/\('/g, '("') // Remplacer ' par "
					.replace(/', \(\)/g, '", ()') // Remplacer ', ()' par ", ()"
					.replace(/throw new Error.*/g, "")
					.replace(/\/\/ From .*/g, "")
					.replace(/Snippets generated.*/, "")
					.replace(/^\n/gm, "")
					.replace(/^\s*\n/gm, "\n")
					.replace(/}\);/g, "});\n");

				// Écrire la sortie filtrée et transformée dans un fichie
				const dirPath = path.dirname(stepFile);
				fs.mkdirSync(dirPath, { recursive: true });
				fs.writeFileSync(stepFile, transformedOutput);
				console.log(`Steps enregistrés dans ${stepFile}`);
			} else {
				console.log(
					'Impossible de trouver les sections "Snippets generated" et "Snippets added" dans la sortie.',
				);
			}
		}
	} catch (error) {
		console.error("Erreur lors de l'exécution de la commande :", error);
	}
});
