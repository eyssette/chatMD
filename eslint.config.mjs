import { defineConfig, globalIgnores, includeIgnoreFile } from "eslint/config";
import path from "node:path";
import globals from "globals";
import js from "@eslint/js";
import codeceptjs from "eslint-plugin-codeceptjs";

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
	{
		rules: {
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
]);
