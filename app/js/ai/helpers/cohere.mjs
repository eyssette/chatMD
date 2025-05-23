export function extractCohereText(chunkObject, version) {
	switch (version) {
		case "v1":
			return chunkObject.text ? chunkObject.text : "";
		case "v2":
			return chunkObject.delta &&
				chunkObject.delta.message &&
				chunkObject.delta.message.content &&
				chunkObject.delta.message.content
				? chunkObject.delta.message.content.text
				: "";
		default:
			throw new Error("Version d'API Cohere non supportée : " + version);
	}
}
