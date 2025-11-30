const { I } = inject();

Given("Je lance ChatMD {string}", async (hash) => {
	const src = hash ? hash.trim() : "#";
	I.loadAchatbot(src);
});

Given("J'appuie sur la touche Entrée", () => {
	I.pressKey("Enter");
});

Given("J'appuie sur le bouton “Envoyer”", () => {
	I.click("#send-button");
});
