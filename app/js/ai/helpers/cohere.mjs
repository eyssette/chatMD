export function extractCohereText(chunkObject, version) {
	switch (version) {
		case "v1":
			return chunkObject.text ? chunkObject.text : "";
		case "v2":
			return chunkObject.message &&
				chunkObject.message.content &&
				chunkObject.message.content[0]
				? chunkObject.message.content[0].text
				: "";
		default:
			throw new Error("Version d'API Cohere non supportée : " + version);
	}
}
