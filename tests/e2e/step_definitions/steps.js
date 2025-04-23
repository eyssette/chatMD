const { I } = inject();
// Add in your custom step files

Given('I am on the ChatMD website', async () => {
  // From "features/basic.feature" {"line":7,"column":5}
  I.amOnPage('');
	I.see("ChatMD");
});

When('I ask what license ChatMD uses', () => {
  // From "features/basic.feature" {"line":8,"column":5}
	I.askTheChatbot("quelle est la licence de ChatMD ?");
});

Then('The chatbot answers that ChatMD is licensed under the MIT licence',  () => {
  // From "features/basic.feature" {"line":9,"column":5}
  I.pressKey('Enter');
  //await I.waitForTypewriterToFinish();
  I.waitForText("licence MIT",10);
});

Given('I\'m using the chatbot about the methodology for a philosophy dissertation', () => {
  // From "features/basic.feature" {"line":13,"column":5}
  I.amOnPage('#dissertation-philo')
  I.see("La dissertation en philosophie")
});

When('I ask if I can use a thesis-antithesis-synthetis structure', () => {
  // From "features/basic.feature" {"line":14,"column":5}
  I.askTheChatbot("Puis-je utiliser un plan thèse antithèse synthèse ?")
});

Then('The chatbot explains that the thesis-antithesis-synthesis structure is not appropriate for a philosophy dissertation', () => {
  // From "features/basic.feature" {"line":15,"column":5}
  I.waitForText("Ce n'est pas ce qu'il faut faire !",10)
});
