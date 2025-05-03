function isJSONComplete(str) {
	try {
		JSON.parse(str);
		return true;
	} catch (error) {
		console.log(error);
		return false;
	}
}

export function parseChunkSafely(chunkToParse, incompleteBuffer) {
	incompleteBuffer += chunkToParse;
	if (!isJSONComplete(incompleteBuffer)) {
		return { parsed: null, incompleteChunkBuffer: incompleteBuffer };
	}
	const parsed = JSON.parse(incompleteBuffer);
	incompleteBuffer = "";
	return { parsed: parsed, incompleteChunkBuffer: incompleteBuffer };
}
