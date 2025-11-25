import {
	handleNewResponseTitle,
	handleKeywords,
	handleDynamicContent,
	handleChoiceOptions,
} from "../../../../../../app/js/core/chatbot/parsers/helpers/processorsChatbotContent.mjs";
import { config } from "../../../../../../app/js/config.mjs";

describe("handleNewResponseTitle", () => {
	it("pushes currentData to chatbotData and reset currentData fields", () => {
		const line = "## New Title";
		const yaml = {
			responsesTitles: ["## "],
		};
		const currentData = {
			responseTitle: "Old Title",
			keywords: ["keyword1", "keyword2"],
			choiceOptions: [
				[
					{
						text: "Voir le choix 1",
						link: "choix 1",
						isRandom: true,
						condition: "",
					},
					{
						text: "Voir le choix 2",
						link: "choix 2",
						isRandom: false,
						condition: "",
					},
				],
			],
			content: ["Some content"],
		};
		const chatbotData = [];

		handleNewResponseTitle(line, yaml, currentData, chatbotData);

		expect(chatbotData[0]).toEqual({
			title: "Old Title",
			keywords: ["keyword1", "keyword2"],
			choiceOptions: [
				[
					{
						text: "Voir le choix 1",
						link: "choix 1",
						isRandom: true,
						condition: "",
					},
					{
						text: "Voir le choix 2",
						link: "choix 2",
						isRandom: false,
						condition: "",
					},
				],
			],
			content: ["Some content"],
		});
		expect(currentData.responseTitle).toBe("New Title");
		expect(currentData.keywords).toEqual([]);
		expect(currentData.choiceOptions).toBeNull();
		expect(currentData.content).toEqual([]);
		expect(currentData.listParsed).toBe(false);
	});

	it("only sets currentData fields when there is no existing responseTitle", () => {
		const line = "## New Title";
		const yaml = {
			responsesTitles: ["## "],
		};
		const currentData = {
			responseTitle: null,
			keywords: [],
			choiceOptions: null,
			content: [],
		};
		const chatbotData = [];

		handleNewResponseTitle(line, yaml, currentData, chatbotData);

		expect(currentData.responseTitle).toBe("New Title");
		expect(currentData.keywords).toEqual([]);
		expect(currentData.choiceOptions).toBeNull();
		expect(currentData.content).toEqual([]);
		expect(currentData.listParsed).toBe(false);
	});

	it("handles custom responsesTitles", () => {
		const line = "### New Title";
		const yaml = {
			responsesTitles: ["### "],
		};
		const currentData = {
			responseTitle: "Old Title",
			keywords: ["keyword1", "keyword2"],
			choiceOptions: [
				[
					{
						text: "Voir le choix 1",
						link: "choix 1",
						isRandom: true,
						condition: "",
					},
					{
						text: "Voir le choix 2",
						link: "choix 2",
						isRandom: false,
						condition: "",
					},
				],
			],
			content: ["Some content"],
		};
		const chatbotData = [];

		handleNewResponseTitle(line, yaml, currentData, chatbotData);

		expect(chatbotData[0]).toEqual({
			title: "Old Title",
			keywords: ["keyword1", "keyword2"],
			choiceOptions: [
				[
					{
						text: "Voir le choix 1",
						link: "choix 1",
						isRandom: true,
						condition: "",
					},
					{
						text: "Voir le choix 2",
						link: "choix 2",
						isRandom: false,
						condition: "",
					},
				],
			],
			content: ["Some content"],
		});
		expect(currentData.responseTitle).toBe("New Title");
		expect(currentData.keywords).toEqual([]);
		expect(currentData.choiceOptions).toBeNull();
		expect(currentData.content).toEqual([]);
		expect(currentData.listParsed).toBe(false);
	});
});

describe("handleKeywords", () => {
	it("adds keywords to currentData.keywords", () => {
		const line = "- keyword2";
		const currentData = {
			keywords: ["keyword1"],
		};

		handleKeywords(line, currentData);

		expect(currentData.keywords).toEqual(["keyword1", "keyword2"]);
	});

	it("trims whitespace from keywords", () => {
		const line = "- keyword2 ";
		const currentData = {
			keywords: ["keyword1"],
		};

		handleKeywords(line, currentData);

		expect(currentData.keywords).toEqual(["keyword1", "keyword2"]);
	});
});

fdescribe("handleDynamicContent", () => {
	it("returns false if dynamicContent is not enabled in yaml", () => {
		const line = "`if @userIsLoggedIn==true`";
		const currentData = {};
		const yaml = { dynamicContent: false };

		const result = handleDynamicContent(line, currentData, yaml);

		expect(result).toBe(false);
	});

	it("handles opening if block", () => {
		const line = "`if @userIsLoggedIn==true`";
		const currentData = { content: [] };
		const yaml = { dynamicContent: true };

		const result = handleDynamicContent(line, currentData, yaml);

		expect(result).toBe(true);
		expect(currentData.conditionStack).toEqual(["@userIsLoggedIn==true"]);
		expect(currentData.condition).toBe("@userIsLoggedIn==true");
		expect(currentData.content).toEqual([line + "\n"]);
		expect(currentData.listParsed).toBe(true);
	});

	it("handles closing endif block", () => {
		const line = "`endif`";
		const currentData = {
			conditionStack: ["@userIsLoggedIn==true"],
			content: [],
		};
		const yaml = { dynamicContent: true };

		const result = handleDynamicContent(line, currentData, yaml);

		expect(result).toBe(true);
		expect(currentData.conditionStack).toEqual([]);
		expect(currentData.condition).toBe("");
		expect(currentData.content).toEqual([line + "\n"]);
		expect(currentData.listParsed).toBe(true);
	});

	it("handles nested if blocks", () => {
		const lineIf1 = "`if @userIsLoggedIn==true`";
		const lineIf2 = "`if @userIsAdmin==true`";
		const lineEndif = "`endif`";
		const currentData = { content: [] };
		const yaml = { dynamicContent: true };

		handleDynamicContent(lineIf1, currentData, yaml);
		expect(currentData.conditionStack).toEqual(["@userIsLoggedIn==true"]);
		expect(currentData.condition).toBe("@userIsLoggedIn==true");

		handleDynamicContent(lineIf2, currentData, yaml);
		expect(currentData.conditionStack).toEqual([
			"@userIsLoggedIn==true",
			"@userIsAdmin==true",
		]);
		expect(currentData.condition).toBe(
			"@userIsLoggedIn==true && @userIsAdmin==true",
		);

		handleDynamicContent(lineEndif, currentData, yaml);
		expect(currentData.conditionStack).toEqual(["@userIsLoggedIn==true"]);
		expect(currentData.condition).toBe("@userIsLoggedIn==true");
		expect(currentData.listParsed).toBe(true);

		handleDynamicContent(lineEndif, currentData, yaml);
		expect(currentData.conditionStack).toEqual([]);
		expect(currentData.condition).toBe("");
		expect(currentData.listParsed).toBe(true);
	});
});

describe("handleChoiceOptions", () => {
	it("adds choice option to currentData.choiceOptions", () => {
		const choiceInformations = {
			text: "Go to section 1",
			url: "section-1",
			isRandom: false,
		};
		const yaml = { obfuscate: false };
		const currentData = { choiceOptions: [] };

		handleChoiceOptions(choiceInformations, yaml, currentData);

		expect(currentData.choiceOptions).toEqual([
			{
				text: "Go to section 1",
				link: "section-1",
				isRandom: false,
				condition: undefined,
			},
		]);
	});

	it("obfuscates link when yaml.obfuscate is true", () => {
		const choiceInformations = {
			text: "Go to section 1",
			url: "section-1",
			isRandom: false,
		};
		const yaml = { obfuscate: true };
		const currentData = { choiceOptions: [] };

		handleChoiceOptions(choiceInformations, yaml, currentData);
		const obfuscatedLink = currentData.choiceOptions[0].link;

		expect(obfuscatedLink).toBe("c2VjdGlvbi0x");
	});

	it("uses default text when choiceInformations.text is empty", () => {
		const choiceInformations = {
			text: "",
			url: "section-1",
			isRandom: false,
		};
		const yaml = { obfuscate: false };
		const currentData = { choiceOptions: [] };

		handleChoiceOptions(choiceInformations, yaml, currentData);

		expect(currentData.choiceOptions[0].text).toBe(
			config.defaultChoiceOptionText,
		);
	});

	it("handles anchor links correctly", () => {
		const choiceInformations = {
			text: "Go to section 1",
			url: "#section-1-link",
			isRandom: false,
		};
		const yaml = { obfuscate: false };
		const currentData = { choiceOptions: [] };

		handleChoiceOptions(choiceInformations, yaml, currentData);

		expect(currentData.choiceOptions[0].link).toBe("section 1 link");
	});
});
