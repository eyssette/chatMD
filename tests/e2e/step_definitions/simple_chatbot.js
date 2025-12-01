const { I } = inject();

Then("Le titre du chatbot est {string}", async (title) => {
	I.seeInSource(`<h1 id="chatbot-name">${title}</h1>`);
});
