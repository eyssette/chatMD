export default {
	spec_dir: "tests/unit",
	spec_files: ["**/*[sS]pec.?(m)js"],
	helpers: ["tests/unit/.config/helpers.mjs"],
	env: {
		stopSpecOnExpectationFailure: false,
		random: true,
		forbidDuplicateNames: true,
	},
};
