export default {
	/* eslint-disable-next-line camelcase */
	spec_dir: "tests/unit",
	/* eslint-disable-next-line camelcase */
	spec_files: ["**/*[sS]pec.?(m)js"],
	helpers: ["tests/unit/.config/helpers.mjs"],
	env: {
		stopSpecOnExpectationFailure: false,
		random: true,
		forbidDuplicateNames: true,
	},
};
