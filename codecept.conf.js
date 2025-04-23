exports.config = {
	output: "./tests/e2e/output",
	helpers: {
		Playwright: {
			browser: "chromium",
			url: "http://127.0.0.1:5501/app/",
			show: true,
			locale: "fr-FR",
		},
	},
	include: {
		I: "./tests/e2e/.config/steps_file.js",
	},
	mocha: {},
	bootstrap: null,
	timeout: null,
	teardown: null,
	hooks: [],
	gherkin: {
		features: "./features/**/*.feature",
		steps: "./tests/e2e/step_definitions/*.js",
	},
	plugins: {
		screenshotOnFail: {
			enabled: true,
		},
		tryTo: {
			enabled: true,
		},
		retryFailedStep: {
			enabled: true,
		},
		retryTo: {
			enabled: true,
		},
		eachElement: {
			enabled: true,
		},
		pauseOnFail: {},
	},
	stepTimeout: 0,
	stepTimeoutOverride: [
		{
			pattern: "wait.*",
			timeout: 0,
		},
		{
			pattern: "amOnPage",
			timeout: 0,
		},
	],
	name: "chatMD",
};
