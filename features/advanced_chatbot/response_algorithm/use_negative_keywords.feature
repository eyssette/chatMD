Feature: Utliser des mots-clés négatifs pour éviter une réponse
	On peut utliser des mots-clés négatifs pour éviter une réponse

	Scenario Outline: On peut utiliser des mots-clés négatifs pour diminuer la chance d'obtenir une réponse
		Given Je lance ChatMD "raw.md"
			"""
			# Chatbot voyages

			Où aimerais-tu partir en vacances ?

			## plage
			- detendre
			- ! pas la chaleur

			La plage est idéale pour se reposer au chaud.

			## montagne
			- détendre
			- ! pas le froid

			La montagne, c'est parfait pour se détendre au frais !
			"""
		When Je demande "<question>"
		Then Le chatbot répond "<answer>"

		Examples:
			| question                                           | answer                                                 |
			| Je veux me détendre, mais je n'aime pas la chaleur | La montagne, c'est parfait pour se détendre au frais ! |
			| Je veux me détendre, mais je n'aime pas le froid   | La plage est idéale pour se reposer au chaud.          |