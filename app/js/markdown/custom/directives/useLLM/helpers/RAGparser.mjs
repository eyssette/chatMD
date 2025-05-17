function parseValue(value) {
	if (value.startsWith("[") && value.endsWith("]")) {
		// Traitement des options qui contiennent de l'information sous forme d'un tableau
		return value
			.slice(1, -1)
			.split(",")
			.map((v) => stripQuotes(v.trim()));
	}
	return stripQuotes(value);
}

function stripQuotes(str) {
	if (
		(str.startsWith('"') && str.endsWith('"')) ||
		(str.startsWith("'") && str.endsWith("'"))
	) {
		return str.slice(1, -1);
	}
	return str;
}

export function parseOptions(optionsList) {
	const regex = /(\w+):(\[[^\]]*\]|"[^"]*"|'[^']*'|[^\s]+)/g;
	// Cette expression régulière permet d'extraire des paires clé:valeur dans une chaîne de texte.
	// Elle capture :
	//   1. Une clé constituée de caractères alphanumériques ou underscore : (\w+)
	//   2. Suivie d’un deux-points : (:)
	//   3. Puis d’une valeur pouvant être :
	//      - une liste entre crochets, ex : [a, b]              → (\[[^\]]*\])
	//      - une chaîne entre guillemets doubles, ex : "text"   → ("[^"]*")
	//      - une chaîne entre guillemets simples, ex : 'text'   → ('[^']*')
	//      - ou une valeur simple sans espaces                  → ([^\s]+)
	return Object.fromEntries(
		[...optionsList.matchAll(regex)].map(([, key, rawValue]) => [
			key.trim(),
			parseValue(rawValue.trim()),
		]),
	);
}

export function parseRAGdirective(content) {
	const RAGline = content.split("\n").find((line) => line.includes("!RAG:"));
	if (!RAGline) return null;

	const RAGparameters = [...RAGline.matchAll(/{([^{}]+)}/g)];
	if (RAGparameters.length < 2) return null;

	return {
		question: RAGparameters[0][1].trim(),
		optionsList: RAGparameters[1][1],
	};
}
