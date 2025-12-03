Feature: Définir des mots-clés pour déclencher une réponse
	On peut définir des mots-clés qui déclenchent une réponse spécifique du chatbot.

	Scenario Outline: Définir des mot-clés pour déclencher une réponse si la question contient exactement le mot-clé
		Given Je lance ChatMD "raw.md"
			"""
			# Chatbot voyages

			Où aimerais-tu partir en vacances ?

			## plage
			- détendre

			La plage est idéale pour se reposer.

			## montagne
			- paysages

			La montagne, c'est parfait pour les promenades en pleine nature.
			"""
		When Je demande "<question>"
		Then Le chatbot répond "<answer>"
		Examples:
			| question                              | answer                                                           |
			| Je veux me détendre                   | La plage est idéale pour se reposer.                             |
			| J'ai envie de voir des beaux paysages | La montagne, c'est parfait pour les promenades en pleine nature. |

	Scenario Outline: Définir des mot-clés pour déclencher une réponse si la question contient une partie du mot-clé
		Given Je lance ChatMD "raw.md"
			"""
			# Chatbot voyages

			Où aimerais-tu partir en vacances ?

			## plage
			- baigner

			La plage est idéale pour se reposer.

			## montagne
			- randonnée

			La montagne, c'est parfait pour les promenades en pleine nature.
			"""
		When Je demande "<question>"
		Then Le chatbot répond "<answer>"
		Examples:
			| question                  | answer                                                           |
			| J'ai envie de baignades ! | La plage est idéale pour se reposer                              |
			| J'adore faire de la rando | La montagne, c'est parfait pour les promenades en pleine nature. |

	Scenario Outline: On peut utiliser des mots-clés avec des accents ou des majuscules, mais la détection est insensible à la casse et aux accents
		Given Je lance ChatMD "raw.md"
			"""
			# Chatbot voyages

			Où aimerais-tu partir en vacances ?

			## plage
			- Détendre

			La plage est idéale pour se reposer.

			## montagne
			- Paysages

			La montagne, c'est parfait pour les promenades en pleine nature.
			"""
		When Je demande "<question>"
		Then Le chatbot répond "<answer>"

		Examples:
			| question                        | answer                                                           |
			| je veux me DETENDRE             | La plage est idéale pour se reposer.                             |
			| j'ai envie de voir des PAYSAGES | La montagne, c'est parfait pour les promenades en pleine nature. |

	Scenario Outline: La détection des mots-clés tolère des fautes de frappe mineures
		Given Je lance ChatMD "raw.md"
			"""
			# Chatbot voyages

			Où aimerais-tu partir en vacances ?

			## plage
			- detendre

			La plage est idéale pour se reposer.

			## montagne
			- paysages

			La montagne, c'est parfait pour les promenades en pleine nature.
			"""
		When Je demande "<question>"
		Then Le chatbot répond "<answer>"

		Examples:
			| question                        | answer                                                           |
			| je veux me detednre             | La plage est idéale pour se reposer.                             |
			| j'ai envie de voir des payasges | La montagne, c'est parfait pour les promenades en pleine nature. |

	Scenario Outline: Les mots-clés se combinent pour calculer la meilleure réponse
		Given Je lance ChatMD "raw.md"
			"""
			# Chatbot voyages

			Où aimerais-tu partir en vacances ?

			## plage
			- detendre
			- baignade
			- la mer

			La plage est idéale pour se reposer.

			## montagne
			- paysages
			- randonnée

			La montagne, c'est parfait pour les promenades en pleine nature.
			"""
		When Je demande "<question>"
		Then Le chatbot répond "<answer>"

		Examples:
			| question                                                                        | answer                                                           |
			| je veux me détendre mais aussi faire de la randonnée et voir des beaux paysages | La montagne, c'est parfait pour les promenades en pleine nature. |
			| j'aime bien la rando, mais je préfère me baigner dans la mer                    | La plage est idéale pour se reposer.                             |



