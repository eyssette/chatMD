import { JSDOM } from "jsdom";

let initializeChatbot;

beforeEach(async () => {
	const { window } = new JSDOM(`<!DOCTYPE html><body>
    <h1 id="chatbot-name">&nbsp;</h1>
    <main>
        <div id="chat" class="chat-container" role="region" aria-label="Zone de conversation">
            <!-- La conversation sera affichée ici -->
        </div>
        <div id="controls">
            <div id="input-container">
                <label id="user-input-label" class="sr-only" for="user-input">Écrivez votre message</label>
                <div id="user-input" contenteditable="true" placeholder="Écrivez votre message" tabindex="0" role="textbox" aria-labelledby="user-input-label" title="Écrivez votre message"></div>
            </div>
            <button id="send-button" type="button">Envoyer</button>
        </div>
    </main>
    <footer id="footer">
        ChatMD – Outil libre & gratuit créé par <a href="http://eyssette.forge.apps.education.fr/">Cédric Eyssette</a>
    </footer>
    <script src="script.min.js"></script>
</body>`);

	global.window = window;
	global.document = window.document;

	const mod = await import("../../../../app/js/core/chatbot/initialize.mjs");

	initializeChatbot = mod.initializeChatbot;
});

describe("initializeChatbot", () => {
	it("initializes a basic chatbot with no responses, no specific YAML and no params", async () => {
		const chatbotData = {
			title: "Test Chatbot",
			initialMessage: {
				content: ["Welcome to the test chatbot!"],
				choiceOptions: [],
			},
			responses: [],
		};
		const yaml = {
			searchInContent: false,
			useLLM: {},
			responseTitles: ["## "],
			dynamicContent: false,
			typeWriter: false,
		};
		const params = null;
		const chatbot = await initializeChatbot(chatbotData, yaml, params);

		expect(chatbot.dynamicVariables).toEqual({});
		expect(chatbot.responses).toEqual([]);
		expect(chatbot.initialMessage).toEqual(
			'Welcome to the test chatbot!\n<ul class="messageOptions"></ul>',
		);
		expect(document.getElementById("chatbot-name").innerHTML).toBe(
			"Test Chatbot",
		);
		expect(document.title).toBe("Test Chatbot");
	});

	it("initializes a chatbot with choices dynamic variables from params", async () => {
		const chatbotData = {
			title: "Test Chatbot",
			initialMessage: {
				content: ["Welcome to the test chatbot!"],
				choiceOptions: [{ text: "Option 1", link: "option1" }],
			},
			responses: [],
		};
		const yaml = {
			searchInContent: false,
			useLLM: {},
			responseTitles: ["## "],
			dynamicContent: true,
			typeWriter: false,
		};
		const params = {
			name: "John",
			age: "30",
			actions: "e:who are you?|c:option 1",
		};
		const chatbot = await initializeChatbot(chatbotData, yaml, params);

		expect(chatbot.dynamicVariables).toEqual({
			GETname: "John",
			GETage: "30",
		});
		expect(chatbot.responses).toEqual([]);
		expect(chatbot.initialMessage).toEqual(
			'Welcome to the test chatbot!\n<ul class="messageOptions"><li><a href="#option1">Option 1</a></li>\n</ul>',
		);
		expect(document.getElementById("chatbot-name").innerHTML).toBe(
			"Test Chatbot",
		);
		expect(document.title).toBe("Test Chatbot");
		expect(chatbot.actions).toEqual(["e:who are you?", "c:option 1"]);
	});

	it("initializes a chatbot with a title containing Markdown tags", async () => {
		const chatbotData = {
			title: "**Bold** and _Italic_ Chatbot",
			initialMessage: {
				content: ["Welcome to the test chatbot!"],
				choiceOptions: [],
			},
			responses: [],
		};
		const yaml = {
			searchInContent: false,
			useLLM: {},
			responseTitles: ["## "],
			dynamicContent: false,
			typeWriter: false,
		};
		const params = null;
		const chatbot = await initializeChatbot(chatbotData, yaml, params);

		expect(document.getElementById("chatbot-name").innerHTML).toBe(
			"<strong>Bold</strong> and <em>Italic</em> Chatbot",
		);
		expect(document.title).toBe("Bold and Italic Chatbot");
	});

	it("precalculate vector chatbot responses when searchInContent is true", async () => {
		const chatbotData = {
			title: "Test Chatbot",
			initialMessage: {
				content: ["Welcome to the test chatbot!"],
				choiceOptions: [],
			},
			responses: [
				{ title: "Response 1", content: "This is the first response." },
				{ title: "Response 2", content: "This is the second response." },
			],
		};
		const yaml = {
			searchInContent: true,
			useLLM: {},
			responseTitles: ["## "],
			dynamicContent: false,
			typeWriter: false,
		};
		const params = null;
		const chatbot = await initializeChatbot(chatbotData, yaml, params);

		expect(chatbot.vectorChatBotResponses.length).toBe(2);
		expect(chatbot.vectorChatBotResponses[0]).toEqual({
			response: 32.4,
			respo: 24.53333333333333,
			espon: 24.133333333333333,
			spons: 24.133333333333333,
			ponse: 24.133333333333333,
			respon: 26.6,
			espons: 26.2,
			sponse: 26.2,
			respons: 32,
			esponse: 31.6,
			first: 11.2,
		});
		expect(chatbot.vectorChatBotResponses[1]).toEqual({
			response: 32.4,
			respo: 24.53333333333333,
			espon: 24.133333333333333,
			spons: 24.133333333333333,
			ponse: 24.133333333333333,
			respon: 26.6,
			espons: 26.2,
			sponse: 26.2,
			respons: 32,
			esponse: 31.6,
			second: 11.6,
			secon: 5.6,
			econd: 5.4,
		});
	});

	it("sets up RAG content when specified as a string in YAML", async () => {
		const chatbotData = {
			title: "Test Chatbot",
			initialMessage: {
				content: ["Welcome to the test chatbot!"],
				choiceOptions: [],
			},
			responses: [],
		};
		const yaml = {
			searchInContent: false,
			useLLM: {
				RAGinformations: "This is the first response.",
			},
			responseTitles: ["## "],
			dynamicContent: false,
			typeWriter: false,
		};
		const params = null;
		const chatbot = await initializeChatbot(chatbotData, yaml, params);

		expect(chatbot.RAG).toBeDefined();

		expect(chatbot.RAG.content).toEqual(["This is the first response."]);
		expect(chatbot.RAG.vector).toEqual([
			{
				first: 11.2,
				response: 6.2,
				respo: 2.2666666666666666,
				espon: 2.066666666666667,
				spons: 2.066666666666667,
				ponse: 2.066666666666667,
				respon: 3.3,
				espons: 3.1,
				sponse: 3.1,
				respons: 6,
				esponse: 5.8,
			},
		]);
	});

	it("sets up RAG content when specified as an array in YAML", async () => {
		const chatbotData = {
			title: "Test Chatbot",
			initialMessage: {
				content: ["Welcome to the test chatbot!"],
				choiceOptions: [],
			},
			responses: [],
		};
		const yaml = {
			searchInContent: false,
			useLLM: {
				RAGinformations: [
					"https://codimd.apps.education.fr/DeuOq2i2TCmibyyRSXlWhQ/download",
				],
			},
			responseTitles: ["## "],
			dynamicContent: false,
			typeWriter: false,
		};
		const params = null;
		const chatbot = await initializeChatbot(chatbotData, yaml, params);

		expect(chatbot.RAG.content).toEqual(["# Testons un fichier RAG simple"]);
		expect(chatbot.RAG.vector[0]).toEqual({
			testons: 12,
			testo: 3.1,
			eston: 2.9,
			stons: 2.9,
			teston: 5.8,
			estons: 5.6,
			fichier: 12,
			fichi: 3.1,
			ichie: 2.9,
			chier: 2.9,
			fichie: 5.8,
			ichier: 5.6,
			simple: 11.6,
			simpl: 5.6,
			imple: 5.4,
		});
	});

	it("initializes a chatbot with default values for nextMessage and choiceOptionsLastResponse", async () => {
		const chatbotData = {
			title: "Test Chatbot",
			initialMessage: {
				content: ["Welcome to the test chatbot!"],
				choiceOptions: [],
			},
			responses: [],
		};
		const yaml = {
			searchInContent: false,
			useLLM: {},
			responseTitles: ["## "],
			dynamicContent: false,
			typeWriter: false,
		};
		const params = null;
		const chatbot = await initializeChatbot(chatbotData, yaml, params);

		expect(chatbot.nextMessage).toEqual({
			goto: "",
			lastMessageFromBot: "",
			selected: undefined,
			onlyIfKeywords: false,
			errorsCounter: 0,
			maxErrors: 3,
			messageIfKeywordsNotFound: "",
		});
		expect(chatbot.choiceOptionsLastResponse).toEqual([]);
	});

	it("handles an initial message with a unique section", async () => {
		const chatbotData = {
			title: "Test Chatbot",
			initialMessage: {
				content: [
					'<section class="unique">This is a unique section message.</section>',
					"This is a normal message.",
				],
				choiceOptions: [],
			},
			responses: [],
		};
		const yaml = {
			searchInContent: false,
			useLLM: {},
			responseTitles: ["## "],
			dynamicContent: false,
			typeWriter: false,
		};
		const params = null;
		const chatbot = await initializeChatbot(chatbotData, yaml, params);

		expect(chatbot.initialMessage).toEqual(
			'\n\nThis is a normal message.\n<ul class="messageOptions"></ul>',
		);
	});
});
