import { JSDOM } from "jsdom";

let parseMarkdown;

const defaultYAML = {
	responsesTitles: ["## "],
};

describe("parseMarkdown", () => {
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
        ChatMD – Outil libre & gratuit créé par <a href="https://eyssette.forge.apps.education.fr/">Cédric Eyssette</a>
    </footer>
    <script src="script.min.js"></script>
</body>`);

		global.window = window;
		global.document = window.document;

		// Importer le module APRÈS avoir créé global.document
		const mod = await import(
			"../../../../app/js/core/chatbot/parseMarkdown.mjs"
		);
		parseMarkdown = mod.parseMarkdown;
	});

	it("parses a simple Markdown file", () => {
		const md = `# Chatbot Title

Content of the introduction.

## Response 1

This is the first response.

## Response 2

This is the second response.
`;

		const chatbotData = parseMarkdown(md, defaultYAML);
		expect(chatbotData.title).toBe("Chatbot Title");
		expect(chatbotData.initialMessage.content).toEqual([
			"Content of the introduction.",
		]);
		expect(chatbotData.responses.length).toEqual(2);
		expect(chatbotData.responses[0].content).toEqual([
			"This is the first response.",
		]);
		expect(chatbotData.responses[1].content).toEqual([
			"This is the second response.",
		]);
	});

	it("parses a Markdown file with no responses", () => {
		const md = `# Chatbot Title

This chatbot has no responses.
`;

		const chatbotData = parseMarkdown(md, defaultYAML);
		expect(chatbotData.title).toBe("Chatbot Title");
		expect(chatbotData.initialMessage.content).toEqual([
			"This chatbot has no responses.",
		]);
		expect(chatbotData.responses.length).toEqual(0);
	});

	it("parses a Markdown file with responses with keywords", () => {
		const md = `# Chatbot Title

Welcome to the chatbot!

## Response 1
- keyword1
- keyword2

This is the first response.

## Response 2
- keyword3
- keyword4

This is the second response.
`;
		const chatbotData = parseMarkdown(md, defaultYAML);
		expect(chatbotData.title).toBe("Chatbot Title");
		expect(chatbotData.initialMessage.content).toEqual([
			"Welcome to the chatbot!",
		]);
		expect(chatbotData.responses.length).toEqual(2);
		expect(chatbotData.responses[0].content).toEqual([
			"This is the first response.",
		]);
		expect(chatbotData.responses[0].keywords).toEqual(["keyword1", "keyword2"]);
		expect(chatbotData.responses[1].content).toEqual([
			"This is the second response.",
		]);
		expect(chatbotData.responses[1].keywords).toEqual(["keyword3", "keyword4"]);
	});

	it("parses a Markdown file with responses choice options", () => {
		const md = `# Chatbot Title

Welcome to the chatbot!

## Response 1

This is the first response.

1. [Option 1](option 1)
2. [Option 2](option 2)

## Response 2

This is the second response.

1. [Option 3](option 3)
2. [Option 4](option 4)
`;
		const chatbotData = parseMarkdown(md, defaultYAML);
		expect(chatbotData.title).toBe("Chatbot Title");
		expect(chatbotData.initialMessage.content).toEqual([
			"Welcome to the chatbot!",
		]);
		expect(chatbotData.responses.length).toEqual(2);
		expect(chatbotData.responses[0].content).toEqual([
			"This is the first response.",
		]);
		expect(chatbotData.responses[0].choiceOptions).toEqual([
			{ text: "Option 1", link: "option 1", isRandom: false, condition: "" },
			{ text: "Option 2", link: "option 2", isRandom: false, condition: "" },
		]);
		expect(chatbotData.responses[1].content).toEqual([
			"This is the second response.",
		]);
		expect(chatbotData.responses[1].choiceOptions).toEqual([
			{ text: "Option 3", link: "option 3", isRandom: false, condition: "" },
			{ text: "Option 4", link: "option 4", isRandom: false, condition: "" },
		]);
	});

	it("parses a Markdown file with responses choices with random options", () => {
		const md = `# Chatbot Title

Welcome to the chatbot!

## Response 1

This is the first response.

1) [Option 1](option 1)
2) [Option 2](option 2)

## Response 2

This is the second response.

1. [Option 3](option 3)
2) [Option 4](option 4)
3) [Option 5](option 5)
4. [Option 6](option 6)
`;
		const chatbotData = parseMarkdown(md, defaultYAML);
		expect(chatbotData.title).toBe("Chatbot Title");
		expect(chatbotData.initialMessage.content).toEqual([
			"Welcome to the chatbot!",
		]);
		expect(chatbotData.responses.length).toEqual(2);
		expect(chatbotData.responses[0].content).toEqual([
			"This is the first response.",
		]);
		expect(chatbotData.responses[0].choiceOptions).toEqual([
			{ text: "Option 1", link: "option 1", isRandom: true, condition: "" },
			{ text: "Option 2", link: "option 2", isRandom: true, condition: "" },
		]);
		expect(chatbotData.responses[1].content).toEqual([
			"This is the second response.",
		]);
		expect(chatbotData.responses[1].choiceOptions).toEqual([
			{ text: "Option 3", link: "option 3", isRandom: false, condition: "" },
			{ text: "Option 4", link: "option 4", isRandom: true, condition: "" },
			{ text: "Option 5", link: "option 5", isRandom: true, condition: "" },
			{ text: "Option 6", link: "option 6", isRandom: false, condition: "" },
		]);
	});

	it("parses a Markdown file with conditional blocks", () => {
		const md = `---
variablesDynamiques: true
---

# Chatbot Title

Welcome to the chatbot!

## Response 1

This is the first response.

\`if @age>18\`
You are an adult.
\`endif\`

\`if @age>18\`
1. [Option 1](option 1)
\`endif\`

\`if @age<=18\`
1. [Option 2](option 2)
\`endif\`

## Response 2
This is the second response.
1. [Option 3](option 3)
\`if @subscribed==true\`
2. [Option 4](option 4)
\`endif\`
`;
		let yaml = { ...defaultYAML, dynamicContent: true };
		const chatbotData = parseMarkdown(md, yaml);
		expect(chatbotData.title).toBe("Chatbot Title");
		expect(chatbotData.initialMessage.content).toEqual([
			"Welcome to the chatbot!",
		]);
		expect(chatbotData.responses.length).toEqual(2);
		expect(chatbotData.responses[0].content).toEqual([
			"This is the first response.",
			"`if @age>18`\n",
			"You are an adult.",
			"`endif`\n",
			"`if @age>18`\n",
			"`endif`\n",
			"`if @age<=18`\n",
			"`endif`\n",
		]);
		expect(chatbotData.responses[0].choiceOptions).toEqual([
			{
				text: "Option 1",
				link: "option 1",
				isRandom: false,
				condition: "@age>18",
			},
			{
				text: "Option 2",
				link: "option 2",
				isRandom: false,
				condition: "@age<=18",
			},
		]);
		expect(chatbotData.responses[1].content).toEqual([
			"This is the second response.",
			"`if @subscribed==true`\n",
			"`endif`\n",
		]);
		expect(chatbotData.responses[1].choiceOptions).toEqual([
			{ text: "Option 3", link: "option 3", isRandom: false, condition: "" },
			{
				text: "Option 4",
				link: "option 4",
				isRandom: false,
				condition: "@subscribed==true",
			},
		]);
	});

	it("parses a Markdown file with fixed variables interpreted at display time", () => {
		const md = `---
variables: 
  - name: userName
  - surname: userSurname
---

# Chatbot Title

Hello @{userName} @{userSurname}!

## Response 1

This is the first response for @{userName}.
`;
		let yaml = {
			...defaultYAML,
		};
		yaml.variables = { userName: "John", userSurname: "Doe" };
		const chatbotData = parseMarkdown(md, yaml);
		expect(chatbotData.title).toBe("Chatbot Title");
		expect(chatbotData.initialMessage.content).toEqual([
			"Hello @{userName} @{userSurname}!",
		]);
		expect(chatbotData.responses.length).toEqual(1);
		expect(chatbotData.responses[0].content).toEqual([
			"This is the first response for @{userName}.",
		]);
	});

	it("parses a Markdown file with fixed variables that are interpreted during parsing", () => {
		const md = `---
variables: 
  - _userName: John
  - _userSurname: Doe
---

# Chatbot Title

Hello @{_userName} @{_userSurname}!

## Response 1

This is the first response for @{_userName}.
`;
		let yaml = {
			...defaultYAML,
			variables: { _userName: "John", _userSurname: "Doe" },
		};
		const chatbotData = parseMarkdown(md, yaml);
		expect(chatbotData.title).toBe("Chatbot Title");
		expect(chatbotData.initialMessage.content).toEqual(["Hello John Doe!"]);
		expect(chatbotData.responses.length).toEqual(1);
		expect(chatbotData.responses[0].content).toEqual([
			"This is the first response for John.",
		]);
	});

	it("parses a Markdown file with \r\n line endings", () => {
		const md = `# Chatbot Title\r\n\r\nWelcome to the chatbot!\r\n\r\n## Response 1\r\n\r\nThis is the first response.\r\n`;
		const chatbotData = parseMarkdown(md, defaultYAML);
		expect(chatbotData.title).toBe("Chatbot Title");
		expect(chatbotData.initialMessage.content).toEqual([
			"Welcome to the chatbot!",
		]);
		expect(chatbotData.responses.length).toEqual(1);
		expect(chatbotData.responses[0].content).toEqual([
			"This is the first response.",
		]);
	});

	it("parses a Markdown file with backslashes in LaTeX expressions", () => {
		const md = `# Chatbot Title

Here is a LaTeX expression: $E = mc\\\\^2$.

## Response 1

This is the first response with LaTeX: $a^2 + b^2 = c\\\\^2$.
`;
		const chatbotData = parseMarkdown(md, defaultYAML);
		expect(chatbotData.title).toBe("Chatbot Title");
		expect(chatbotData.initialMessage.content).toEqual([
			"Here is a LaTeX expression: $E = mc&#92;&#92;^2$.",
		]);
		expect(chatbotData.responses.length).toEqual(1);
		expect(chatbotData.responses[0].content).toEqual([
			"This is the first response with LaTeX: $a^2 + b^2 = c&#92;&#92;^2$.",
		]);
	});
	it("parses a Markdown file with no initial message", () => {
		const md = `# Chatbot Title

## Response 1

This is the first response.
`;

		const chatbotData = parseMarkdown(md, defaultYAML);
		expect(chatbotData.title).toBe("Chatbot Title");
		expect(chatbotData.initialMessage.content).toEqual([]);
		expect(chatbotData.responses.length).toEqual(1);
		expect(chatbotData.responses[0].content).toEqual([
			"This is the first response.",
		]);
	});

	it("parses a Markdown file with no title", () => {
		const md = `

Welcome to the chatbot!

## Response 1

This is the first response.
`;
		const defaultTitle = "Chatbot";

		const chatbotData = parseMarkdown(md, defaultYAML);
		expect(chatbotData.title).toBe(defaultTitle);
		expect(chatbotData.initialMessage.content).toEqual([
			"Welcome to the chatbot!",
		]);
		expect(chatbotData.responses.length).toEqual(1);
		expect(chatbotData.responses[0].content).toEqual([
			"This is the first response.",
		]);
	});

	it("parses a Markdown file with an intial message containing choice options", () => {
		const md = `# Chatbot Title

Welcome to the chatbot!

1. [Start](start)
2. [Help](help)

## Start
This is the start response.

## Help
This is the help response.
`;
		const chatbotData = parseMarkdown(md, defaultYAML);
		expect(chatbotData.title).toBe("Chatbot Title");
		expect(chatbotData.initialMessage.content).toEqual([
			"Welcome to the chatbot!",
		]);
		expect(chatbotData.initialMessage.choiceOptions).toEqual([
			{ text: "Start", link: "start", isRandom: false, condition: "" },
			{ text: "Help", link: "help", isRandom: false, condition: "" },
		]);
		expect(chatbotData.responses.length).toEqual(2);
		expect(chatbotData.responses[0].content).toEqual([
			"This is the start response.",
		]);
		expect(chatbotData.responses[1].content).toEqual([
			"This is the help response.",
		]);
	});
});
