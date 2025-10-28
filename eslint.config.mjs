import globals from "globals";
import pluginJs from "@eslint/js";
import codeceptjsPlugin from "eslint-plugin-codeceptjs";

export default [
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.jasmine,
			},
			ecmaVersion: 2018,
		},
	},
	pluginJs.configs.recommended,
	{
		files: ["/app/**/*.js", "/app/**/*.mjs", "tests/**/*.*js"],
		rules: {
			...codeceptjsPlugin.configs.recommended.rules,
			semi: ["error", "always"],
			indent: "off",
			quotes: ["error", "double", { avoidEscape: true }],
			"no-multi-spaces": ["error"],
			"no-trailing-spaces": ["error"],
			"comma-spacing": ["error"],
			"array-bracket-spacing": ["error"],
			"object-curly-spacing": ["error", "always"],
			"space-infix-ops": ["error"],
			camelcase: ["error"],
			"key-spacing": ["error"],
			"no-duplicate-imports": ["error"],
			"padded-blocks": ["error", "never"],
			"space-before-blocks": ["error"],
			"keyword-spacing": ["error"],
		},
	},
];
