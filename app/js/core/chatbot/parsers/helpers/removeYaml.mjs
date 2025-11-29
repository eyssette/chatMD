export function removeYaml(md) {
	md = "\n" + md;
	// On cherche le premier titre H1
	const indexH1 = md.indexOf("\n# ");

	if (indexH1 > -1) {
		// Si on trouve un titre H1, on retourne tout à partir de ce titre
		return md.substring(indexH1).trimStart();
	}

	// S'il n'y a pas de premier titre H1, on cherche un bloc YAML au début
	const trimmed = md.trimStart();
	if (trimmed.startsWith("---\n")) {
		// On cherche la marque de fin du YAML dans le contenu qui se trouve après la marque de début du YAML
		const endIndex = trimmed.indexOf("\n---\n", 4);
		if (endIndex > -1) {
			// On retourne tout ce qui se trouve après la marque de fin du YAML
			return trimmed.substring(endIndex + 5).trimStart();
		}
	}

	// Aucun H1 ni YAML détecté : on retourne le contenu original
	return trimmed;
}
