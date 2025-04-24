const { I } = inject();
// Add in your custom step files

Given("Je suis sur le site de ChatMD", async () => {
	I.amOnPage("");
	I.see("ChatMD");
});

When("Je demande quelle licence ChatMD utilise", () => {
	I.askTheChatbot("quelle est la licence de ChatMD ?");
});

Then("Le chatbot répond que ChatMD est sous licence MIT", () => {
	I.pressKey("Enter");
	I.waitForText("licence MIT", 10);
});

Given(
	"J'utilise le chatbot pour la méthodologie d'une dissertation de philosophie",
	() => {
		I.amOnPage("#dissertation-philo");
		I.see("La dissertation en philosophie");
	},
);

When(
	"Je demande si je peux utiliser une structure thèse-antithèse-synthèse",
	() => {
		I.askTheChatbot("Puis-je utiliser un plan thèse antithèse synthèse ?");
	},
);

Then(
	"Le chatbot explique que la structure thèse-antithèse-synthèse n'est pas appropriée pour une dissertation de philosophie",
	() => {
		I.waitForText("Ce n'est pas ce qu'il faut faire !", 10);
	},
);
