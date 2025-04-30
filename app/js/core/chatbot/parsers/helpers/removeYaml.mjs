export function removeYaml(md) {
	let indexFirstH1title = md.indexOf("\n# ");
	const indexFirstH2title = md.indexOf("\n## ");
	if (indexFirstH2title > -1 && indexFirstH2title == indexFirstH1title - 1) {
		indexFirstH1title = 0;
	}
	md = md.substring(indexFirstH1title);
	return md;
}
