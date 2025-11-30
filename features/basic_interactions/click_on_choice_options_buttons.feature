@core @asUser
Feature: Cliquer sur les boutons des options de choix
	Parfois, le chatbot propose des options de choix sous forme de boutons
	On peut cliquer sur ces boutons pour sélectionner une option

	@chatbot-base
	Scenario: Cliquer sur un bouton d'option de choix
		Given Je lance ChatMD ""
		When Je clique sur le bouton "Quels sont les usages possibles ?"
		Then Le chatbot répond "On peut imaginer de nombreux usages"

	@chatbot-base @chatbot-philosophyDissertation
	Scenario: Cliquer sur une suite d'options de choix
		Given Je lance ChatMD "#dissertation-philo"
		And Je clique sur le bouton "Comment on organise son temps ?"
		And Je clique sur le bouton "Comment on rédige ?"
		When Je clique sur le bouton "Comment on rédige la conclusion ?"
		Then Le chatbot répond "Dans la conclusion, le but est simplement de retracer le cheminement parcouru."