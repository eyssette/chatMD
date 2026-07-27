import codeceptjs from "eslint-plugin-codeceptjs";
import e18e from "@e18e/eslint-plugin";
import stylistic from "@stylistic/eslint-plugin";

// On peut activer le mode "ERRORS_ONLY" en mettant la variable d'environnement ERRORS_ONLY à 1
// Cela permet de ne garder que les règles de type "error" et de désactiver les règles de type "warn" ou "off", afin que le lint se fasse plus rapidement et que l'on puisse se concentrer sur les erreurs à corriger en priorité.
const ERRORS_ONLY = process.env.ERRORS_ONLY === "1";

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
	"eslint/no-undef": "error",
	"eslint/no-unused-vars": ["error", { varsIgnorePattern: "^_" }],
	"eslint/no-ternary": "off",
	"eslint/capitalized-comments": "off",
	"eslint/sort-keys": "off",
	"eslint/func-style": "off",
	"eslint/no-magic-numbers": ["warn", { ignore: [-1, 0, 1] }],
	"eslint/max-lines-per-function": [
		"warn",
		{ max: 100, skipComments: true, skipBlankLines: true },
	],
};

const plugins = ["typescript", "import", "unicorn"];

// RÉGLES SPÉCIFIQUES
// - si on est en mode "ERRORS_ONLY" ou pas
// - pour le dossier "app" et pour le dossier "tests"

const jsPlugins = ERRORS_ONLY
	? []
	: [
			{ name: "e18e", specifier: "@e18e/eslint-plugin" },
			"@stylistic/eslint-plugin",
		];

const asWarn = (rules) =>
	Object.fromEntries(
		Object.entries(rules).map(([rule, config]) => {
			if (Array.isArray(config)) {
				// On extrait le premier élément du tableau des règles
				// car le premier élément est le niveau de sévérité (error, warn, off)
				// et qu'on veut le remplacer par "warn"
				const [_firstElement, ...rest] = config;
				return [rule, ["warn", ...rest]];
			}
			return [rule, config === "error" ? "warn" : config];
		}),
	);
const e18eRulesWarnOnly = asWarn(e18e.configs.recommended.rules);
const categories = ERRORS_ONLY
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

const appFolderOverridesRules = ERRORS_ONLY
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
	"unicorn/filename-case": [
		"error",
		{ case: "snakeCase", ignore: [".spec.mjs"] },
	],
	"eslint/new-cap": "off",
	"eslint/id-length": "off",
	"import/unambiguous": "off",
	"import/no-relative-parent-imports": "off",
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

	overrides: [
		{
			files: ["app/**/*.{js,mjs}"],
			rules: appFolderOverridesRules,
			env: { es2018: true, builtin: true },
		},
		// Override pour les tests :
		// - les fichiers tests e2e sont en snake_case (on rajoute un override ensuite pour les fichiers de tests unitaires qui sont en kebab-case)
		// - on ajoute les variables globales de CodeceptJS et Gherkin
		// - on ajoute l'environnement Node et Jasmine
		// - on ne se contraint pas à rester en ES2018
		{
			files: ["tests/**/*", "./*.{js,mjs}"],
			rules: testFolderOverridesRules,
			env: { builtin: true, browser: true, node: true, jasmine: true },
			globals: {
				...CODECEPT_GLOBALS,
				...GHERKIN_GLOBALS,
			},
		},
		// Override pour les tests unitaires (fichiers .spec.mjs) car on veut que les noms de fichiers soient en kebab-case, comme pour les fichiers Javascript correspondants.
		{
			files: ["tests/unit/**/*.{js, mjs}"],
			rules: {
				"unicorn/filename-case": ["error", { case: "kebabCase" }],
			},
		},
	],

	rules: {
		...baseRules,
	},
};

// oxlint-disable-next-line import/no-default-export
export default config;
