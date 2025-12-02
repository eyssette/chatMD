Feature: Au démarrage, afficher un message initial
	On peut afficher un message initial au démarrage du chatbot.

	Scenario: Afficher un message initial au démarrage
		Given Je lance ChatMD "raw.md"
			"""
			# Bienvenue sur mon chatbot

			Ce chatbot vous aide à trouver des informations sur divers sujets.
			Veuillez poser votre question pour commencer.
			"""
		Then Le chatbot répond "Ce chatbot vous aide à trouver des informations sur divers sujets."

	Scenario: Ne pas afficher de message initial si aucun n'est défini
		Given Je lance ChatMD "raw.md"
			"""
			# Chatbot sans message initial
			1. [Option 1](Option1)
			2. [Option 2](Option2)
			"""
		Then "Le message initial" n'existe pas

	Scenario Outline: Afficher les boutons de choix du message initial et renvoyer la bonne réponse
		Given Je lance ChatMD "raw.md"
			"""
			# Choisissez une option

			Veuillez choisir une option parmi les suivantes :
			1. [Option A](option A)
			2. [Option B](option B)

			## option A
			C'est l'option A
			## option B
			C'est l'option B
			"""
		When Je clique sur le bouton "<option>"
		Then Le chatbot répond "<réponse>"

		Examples:
			| option   | réponse          |
			| Option A | C'est l'option A |
			| Option B | C'est l'option B |
