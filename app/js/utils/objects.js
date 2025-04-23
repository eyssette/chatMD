export function deepMerge(target, source) {
	const isObject = (obj) => obj && typeof obj === "object";

	for (const key in source) {
		if (isObject(source[key])) {
			if (!target[key]) {
				Object.assign(target, { [key]: {} });
			}
			deepMerge(target[key], source[key]);
		} else {
			Object.assign(target, { [key]: source[key] });
		}
	}

	return target;
}
