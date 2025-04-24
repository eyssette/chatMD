function isObject(obj) {
	return obj && typeof obj === "object" && !Array.isArray(obj);
}

export function deepMerge(baseObject, objectToMergeIn) {
	if (!isObject(objectToMergeIn)) return baseObject;
	if (!isObject(baseObject)) return objectToMergeIn;

	const mergedObject = Object.assign({}, baseObject);

	for (const [key, incomingValue] of Object.entries(objectToMergeIn)) {
		const baseValue = mergedObject[key];

		if (isObject(incomingValue) && isObject(baseValue)) {
			mergedObject[key] = deepMerge(baseValue, incomingValue);
		} else {
			mergedObject[key] = incomingValue;
		}
	}

	return mergedObject;
}
