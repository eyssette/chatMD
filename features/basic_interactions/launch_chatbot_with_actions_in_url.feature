Feature: Accéder à un chatbot dont l'URL contient des actions prédéfinies
	On peut accéder à un chatbot avec des actions prédéfinies dans l'URL
	Ces actions représentent un historique de conversation ou le lien vers un message particulier

	Background:
		Given Je lance ChatMD "#dissertation-philo?actions=c:n1|c:n6|c:n9"

	Scenario: Lancer un chatbot qui contient un historique de conversation dans l'URL
		Then Le dernier message contient "Dans la conclusion, le but est simplement de retracer le cheminement parcouru."

	Scenario: Lancer un chatbot qui contient le lien vers un message particulier dans l'URL
		Then Le dernier message contient "Dans la conclusion, le but est simplement de retracer le cheminement parcouru."