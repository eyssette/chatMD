import codeceptjs from "eslint-plugin-codeceptjs";
import e18e from "@e18e/eslint-plugin";
import stylistic from "@stylistic/eslint-plugin";

// On peut activer le mode "SHOW_MAIN_ERRORS_ONLY" en mettant la variable d'environnement SHOW_MAIN_ERRORS_ONLY à 1
// Cela permet de ne garder que les règles principales, afin que le lint se fasse plus rapidement et que l'on puisse se concentrer sur les erreurs à corriger en priorité.
const SHOW_MAIN_ERRORS_ONLY = process.env.SHOW_MAIN_ERRORS_ONLY === "1";

const ECMA_VERSION = "es2018";

// IGNORE PATTERNS

const ignorePatterns = [
	"**/*.min.js",
	"app/js/lib/**/*",
	"app/js/plugins/**/*",
];

const canBeUpperCase = ["RAG", "LLM"];

// GESTION DES VARIABLES GLOBALES

const toReadonlyGlobals = (scope) =>
	Object.fromEntries(Object.keys(scope).map((name) => [name, "readonly"]));
const CODECEPT_GLOBALS = toReadonlyGlobals(
	codeceptjs.environments.codeceptjs.globals,
);
const GHERKIN_GLOBALS = {
	And: "readonly",
	But: "readonly",
	Given: "readonly",
	Then: "readonly",
	When: "readonly",
};

// RÉGLES DE BASE
const baseRules = {
	"unicorn/filename-case": [
		"error",
		{ case: "camelCase", ignore: canBeUpperCase },
	],
	"import/no-duplicates": "error",
	"import/no-named-export": "off",
	"import/no-default-export": "off",
	"import/prefer-default-export": "off",
	"import/no-relative-parent-imports": "off",
	"import/group-exports": "off",
	"import/exports-last": "off",
	"eslint/no-undef": "error",
	"eslint/no-unused-vars": [
		"error",
		{ varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
	],
	"eslint/max-params": ["error", { max: 4 }],
	"eslint/no-param-reassign": ["warn", { props: true }],
	"eslint/no-ternary": "off",
	"eslint/capitalized-comments": "off",
	"eslint/sort-keys": "off",
	"eslint/func-style": "off",
	"eslint/no-magic-numbers": ["warn", { ignore: [-1, 0, 1] }],
	"eslint/max-lines-per-function": [
		"warn",
		{ max: 150, skipComments: true, skipBlankLines: true },
	],
	"eslint/max-statements": ["warn", { max: 20 }],
	"eslint/init-declarations": "off",
	"eslint/no-undefined": "off",
	"eslint/logical-assignment-operators": "off",
	"oxc/no-rest-spread-properties": "off",
	"oxc/no-async-await": "off",
	"oxc/no-barrel-file": ["error", { threshold: 0 }],
};

const plugins = ["eslint", "typescript", "unicorn", "oxc", "import", "promise"];

// RÉGLES SPÉCIFIQUES
// - si on est en mode "SHOW_MAIN_ERRORS_ONLY" ou pas
// - pour le dossier "app" et pour le dossier "tests"

const jsPlugins = SHOW_MAIN_ERRORS_ONLY
	? []
	: [
			{ name: "e18e", specifier: "@e18e/eslint-plugin" },
			"@stylistic/eslint-plugin",
		];

// Modification de la sévérité des règles d'un plugin, pour ne pas avoir trop d'erreurs à corriger en même temps.
const setRulesSeverity = (rules, severity) =>
	Object.fromEntries(
		Object.entries(rules).map(([rule, config]) => {
			if (Array.isArray(config)) {
				// On remplace uniquement la sévérité (premier élément),
				// en conservant le reste de la configuration de la règle.
				const [_firstElement, ...rest] = config;
				return [rule, [severity, ...rest]];
			}
			return [rule, severity];
		}),
	);

const asWarn = (rules) => setRulesSeverity(rules, "warn");

// Les règles du plugin e18e sont mises en mode "warn" car elles visent la modernisation du code et la performance, mais ne sont pas critiques pour le fonctionnement du code.
const e18eRulesWarnOnly = asWarn(e18e.configs.recommended.rules);

const categories = SHOW_MAIN_ERRORS_ONLY
	? {
			correctness: "error",
			suspicious: "warn",
			pedantic: "off",
			perf: "off",
			style: "off",
			restriction: "off",
			nursery: "off",
		}
	: {
			correctness: "error",
			suspicious: "warn",
			pedantic: "warn",
			perf: "warn",
			style: "warn",
			restriction: "warn",
			nursery: "warn",
		};

const appFolderOverridesRules = SHOW_MAIN_ERRORS_ONLY
	? { ...baseRules }
	: {
			...baseRules,
			...e18eRulesWarnOnly,
			...stylistic.configs.recommended.rules,
			"@stylistic/semi": ["error", "always"],
			"@stylistic/indent": "off",
			"@stylistic/quotes": ["error", "double", { avoidEscape: true }],
			"@stylistic/no-multi-spaces": "error",
			"@stylistic/no-trailing-spaces": "error",
			"@stylistic/comma-spacing": "error",
			"@stylistic/array-bracket-spacing": "error",
			"@stylistic/object-curly-spacing": ["error", "always"],
			"@stylistic/space-infix-ops": "error",
			"@stylistic/key-spacing": "error",
			"@stylistic/padded-blocks": ["error", "never"],
			"@stylistic/space-before-blocks": "error",
			"@stylistic/keyword-spacing": "error",
			"@stylistic/no-tabs": ["error", { allowIndentationTabs: true }],
			"@stylistic/operator-linebreak": "off",
			"@stylistic/arrow-parens": ["error", "always"],
			"@stylistic/spaced-comment": ["error", "always"],
			"@stylistic/brace-style": ["error", "1tbs", { allowSingleLine: true }],
			"@stylistic/quote-props": "off",
			"@stylistic/indent-binary-ops": "off",
		};

const testFolderOverridesRules = {
	...baseRules,
	"eslint/new-cap": "off",
	"eslint/id-length": "off",
	"eslint/no-magic-numbers": "off",
	"eslint/max-lines-per-function": "off",
	"eslint/max-statements": "off",
	"eslint/max-lines": "off",
	"import/unambiguous": "off",
};

// CONFIGURATION D'OXLINT

const config = {
	$schema: "./node_modules/oxlint/configuration_schema.json",
	plugins,
	jsPlugins,
	categories,

	env: {
		builtin: true,
		browser: true,
	},

	ignorePatterns,

	rules: {
		...baseRules,
	},

	overrides: [
		// Configuration de base pour tous les fichiers Javascript dans le dossier "app"
		{
			files: ["app/**/*.{js,mjs}"],
			rules: appFolderOverridesRules,
			env: { [ECMA_VERSION]: true, browser: true },
		},
		// Override pour les fichiers Svelte qui définissent des composants web
		{
			files: ["app/**/*.svelte"],
			rules: {
				"import/unambiguous": "off",
				"unicorn/filename-case": ["error", { case: "pascalCase" }],
				"eslint/no-undef": "off",
				"eslint/no-unused-vars": "off",
				"eslint/prefer-const": "off",
			},
		},
		// Override pour les tests :
		// - les fichiers tests e2e sont en snake_case (on rajoute un override ensuite pour les fichiers de tests unitaires qui sont en kebab-case)
		// - on ajoute les variables globales de CodeceptJS et Gherkin
		// - on ajoute l'environnement Node et Jasmine
		// - on ne se contraint pas à rester en ES2020
		{
			files: ["tests/**/*", "./*.{js,mjs}", "scripts/**/*.{js,mjs}"],
			rules: testFolderOverridesRules,
			env: { builtin: true, browser: true, node: true, jasmine: true },
			globals: {
				...CODECEPT_GLOBALS,
				...GHERKIN_GLOBALS,
			},
		},
		{
			files: ["tests/e2e/**/*.{js,mjs}"],
			rules: {
				"unicorn/filename-case": ["error", { case: "snakeCase" }],
			},
		},
		{
			files: [
				"scripts/**/*.{js,mjs}",
				"tests/e2e/.config/**/*.{js,mjs}",
				"i18n/helpers/**/*.{js,mjs}",
				"tests/test-widget.mjs",
			],
			rules: {
				"unicorn/filename-case": ["error", { case: "kebabCase" }],
			},
		},
		// Override pour les tests unitaires (fichiers .spec.mjs) car on veut que les noms de fichiers soient en kebab-case, comme pour les fichiers Javascript correspondants.
		{
			files: ["tests/unit/**/*.{js, mjs}"],
			rules: {
				"unicorn/filename-case": ["error", { case: "kebabCase" }],
			},
		},
		{
			files: ["app/js/iifeFallback.js", "app/sw.mjs", "app/pwa/**/*.{mjs}"],
			env: { builtin: true, browser: true, node: true },
			rules: {
				"import/unambiguous": "off",
				"eslint/no-console": "off",
			},
		},
	],
};

export default config;
