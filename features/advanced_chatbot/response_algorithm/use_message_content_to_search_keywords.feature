Feature: Rechercher dans le contenu des réponses
	Pour permettre une meilleure correspondance, lorsque la configuration YAML contient
	rechercheContenu: true, l'algorithme doit comparer le message de l'utilisateur non seulement
	au titre et aux déclencheurs mais aussi au contenu entier de chaque réponse.

	Scenario Outline: On peut utiliser la recherche dans le contenu pour éviter d'avoir à définir des mots clés, s'ils sont déjà présents dans le contenu du message
		Given Je lance ChatMD "raw.md"
			"""
			---
			rechercheContenu: true
			---
			# Chatbot
			Qu'est-ce que tu aimes bien faire ?
			## Philosophie
			Tu aimes bien réfléchir, la philosophie va te plaire !
			## Sport
			Tu aimes bien bouger, le sport c'est super !
			"""
		When Je demande "<question>"
		Then Le chatbot répond "<answer>"

		Examples:
			| question  | answer                                                 |
			| réfléchir | Tu aimes bien réfléchir, la philosophie va te plaire ! |
			| bouger    | Tu aimes bien bouger, le sport c'est super !           |