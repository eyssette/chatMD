const { I } = inject();

Given("Je lance ChatMD {string}", async (hash) => {
	const src = hash ? hash.trim() : "#";
	I.loadAchatbot(src);
});

When("Je demande {string}", async (question) => {
	I.askTheChatbot(question);
});

Given("Je clique sur le bouton {string}", async (buttonText) => {
	I.pressKey("Enter");
	I.waitForText(buttonText, 10);
	I.click(locate(".messageOptions li a").withText(buttonText));
});

Then("Le chatbot répond {string}", async (answer) => {
	I.pressKey("Enter");
	I.waitForText(answer, 10);
});

Given("J'appuie sur la touche {string}", (string) => {
	I.pressKey(string);
});

Given("J'appuie sur le bouton “Envoyer”", () => {
	I.click("#send-button");
});
