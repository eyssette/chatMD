import { handleNewResponseTitle } from "../../../../../../app/js/core/chatbot/parsers/helpers/processorsChatbotContent.mjs";

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
