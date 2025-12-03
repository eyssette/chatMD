Feature: Le titre d'une réponse peut servir de mot-clé
	Le titre d'une réponse est pris en compte pour déclencher cette réponse
	si l'utilisateur pose une question avec un mot présent dans le titre.

	Scenario Outline: Le titre a été choisi pour servir de déclencheru
		Given Je lance ChatMD "raw.md"
			"""
			# Chatbot
			Quel est votre fruit préféré
			## Des oranges
			Les oranges c'est très bon !
			## Des pommes
			Les pommes c'est très bon !
			"""
		When Je demande "<question>"
		Then Le chatbot répond "<answer>"

		Examples:
			| question | answer                       |
			| L'orange | Les oranges c'est très bon ! |
			| La pomme | Les pommes c'est très bon !  |