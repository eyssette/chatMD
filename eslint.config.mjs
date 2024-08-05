import globals from "globals";
import pluginJs from "@eslint/js";


export default [
	{ languageOptions: { globals: globals.browser } },
	pluginJs.configs.recommended,
	{
		"rules": {
			"semi": ["error", "always"],
			"indent": ["error", "tab"],
			"quotes": ["error", "double", { "avoidEscape": true }],
			"no-multi-spaces": ["error"],
			"no-trailing-spaces": ["error"],
			"comma-spacing": ["error"],
			"array-bracket-spacing": ["error"],
			"object-curly-spacing": ["error", "always"],
		}
	}
];