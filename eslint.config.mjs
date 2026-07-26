import { defineConfig, globalIgnores, includeIgnoreFile } from "eslint/config";
import path from "node:path";
import globals from "globals";
import js from "@eslint/js";
import codeceptjs from "eslint-plugin-codeceptjs";
import stylistic from "@stylistic/eslint-plugin";

const gherkinGlobals = {
	Given: "readonly",
	When: "readonly",
	Then: "readonly",
	And: "readonly",
	But: "readonly",
};

const gitignorePath = path.resolve(import.meta.dirname, ".gitignore");

export default defineConfig([
	// On ignore certains fichiers et dossiers qui ne sont pas pertinents pour l'analyse ESLint
	globalIgnores(["app/js/lib/**", "**/*.min.js", "app/js/plugins/**/*"]),
	includeIgnoreFile(gitignorePath),

	{
		languageOptions: {
			globals: {
				...globals.browser,
			},
		},
		plugins: {
			"@stylistic": stylistic,
		},
	},
	// Règles spécifiques pour les fichiers JS de l'application
	{
		files: ["app/**/*.{js,mjs}"],
		languageOptions: {
			ecmaVersion: 2018,
		},
	},
	// Règles spécifiques pour les fichiers de test
	{
		files: ["tests/**/*", "./*.{js,mjs}"],
		languageOptions: {
			globals: {
				...globals.node,
				...globals.jasmine,
				...codeceptjs.environments.codeceptjs.globals,
				...gherkinGlobals,
			},
			ecmaVersion: 2020,
		},
	},
	js.configs.recommended,
	stylistic.configs.recommended,
	{
		rules: {
			camelcase: ["error"],
			"no-duplicate-imports": ["error"],
			"@stylistic/semi": ["error", "always"],
			"@stylistic/indent": ["off"],
			"@stylistic/quotes": ["error", "double", { avoidEscape: true }],
			"@stylistic/no-multi-spaces": ["error"],
			"@stylistic/no-trailing-spaces": ["error"],
			"@stylistic/comma-spacing": ["error"],
			"@stylistic/array-bracket-spacing": ["error"],
			"@stylistic/object-curly-spacing": ["error", "always"],
			"@stylistic/space-infix-ops": ["error"],
			"@stylistic/key-spacing": ["error"],
			"@stylistic/padded-blocks": ["error", "never"],
			"@stylistic/space-before-blocks": ["error"],
			"@stylistic/keyword-spacing": ["error"],
			"@stylistic/no-tabs": ["error", { allowIndentationTabs: true }],
			"@stylistic/operator-linebreak": ["off"],
			"@stylistic/arrow-parens": ["error", "always"],
			"@stylistic/spaced-comment": ["error", "always"],
			"@stylistic/brace-style": ["error", "1tbs", { allowSingleLine: true }],
			"@stylistic/quote-props": ["off"],
			"@stylistic/indent-binary-ops": ["off"],
		},
	},
]);
