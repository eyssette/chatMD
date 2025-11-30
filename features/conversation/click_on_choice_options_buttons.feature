@core @asUser
Feature: Cliquer sur les boutons des options de choix
	Parfois, le chatbot propose des options de choix sous forme de boutons
	On peut cliquer sur ces boutons pour sélectionner une option

	@chatbot-base
	Scenario: Cliquer sur un bouton d'option de choix
		Given Je lance ChatMD ""
		When Je clique sur un bouton d'option de choix après le message initial
		Then Le chatbot répond en fonction de l'option choisie

	@chatbot-base @chatbot-philosophyDissertation
	Scenario: Cliquer sur une suite d'options de choix
		Given Je lance ChatMD "#dissertation-philo"
		When Je clique sur une suite d'options de choix
		Then Le chatbot répond en fonction de la suite d'options choisies