Feature: Personnaliser le message par défaut en cas de réponse non trouvée
	Si on n'a pas trouvé de réponse correspondant à la question de l'utilisateur,
	chatMD doit renvoyer un message par défaut, que l'on peut configurer dans le YAML

	Scenario: Poser une question hors sujet renvoie un des messages par défaut personnalisé si on a défini une liste dans le YAML
		Given Je lance ChatMD "raw.md"
			"""
			---
			messageParDéfaut: ["Désolé, je n'ai pas compris votre question. Pouvez-vous reformuler ?", "Je ne suis pas sûr de comprendre. Pourriez-vous préciser votre demande ?","Hmmm, cela dépasse mes compétences. Pouvez-vous poser une autre question ?"]
			---
			# Chatbot
			Chatbot sans réponses définies.
			"""
		When Je demande "Quelle est ta couleur préférée ?"
		Then Le chatbot répond "<liste de réponses possibles>"
			| Désolé, je n'ai pas compris votre question. Pouvez-vous reformuler ?       |
			| Je ne suis pas sûr de comprendre. Pourriez-vous préciser votre demande ?   |
			| Hmmm, cela dépasse mes compétences. Pouvez-vous poser une autre question ? |

	Scenario: Poser une question hors sujet redirige vers une réponse spécifique si on a défini un message de fallback dans le YAML
		Given Je lance ChatMD "raw.md"
			"""
			---
			fallback: "Message Fallback"
			---
			# Chatbot
			Chatbot sans réponses définies.
			## Message Fallback
			Ceci est un message de fallback.
			"""
		When Je demande "Quelle est ta couleur préférée ?"
		Then Le chatbot répond "Ceci est un message de fallback."

	Scenario: Poser une question hors sujet renvoie un message par défaut standard, si on a défini un message de fallback dans le YAML mais que la réponse n'existe pas
		Given Je lance ChatMD "raw.md"
			"""
			---
			fallback: "Message Fallback"
			---
			# Chatbot
			Chatbot sans réponses définies.
			"""
		When Je demande "Quelle est ta couleur préférée ?"
		Then Le chatbot répond qu'il ne peut pas répondre à cette question car il n'a pas l'information

	Scenario: Poser une question hors sujet renvoie un message par défaut personnalisé, si on a défini une liste de messages par défaut et un message de fallback dans le YAML mais que la réponse n'existe pas
		Given Je lance ChatMD "raw.md"
			"""
			---
			messageParDéfaut: ["Désolé, je n'ai pas compris votre question. Pouvez-vous reformuler ?", "Je ne suis pas sûr de comprendre. Pourriez-vous préciser votre demande ?","Hmmm, cela dépasse mes compétences. Pouvez-vous poser une autre question ?"]
			fallback: "Message Fallback"
			---
			# Chatbot
			Chatbot sans réponses définies.
			"""
		When Je demande "Quelle est ta couleur préférée ?"
		Then Le chatbot répond "<liste de réponses possibles>"
			| Désolé, je n'ai pas compris votre question. Pouvez-vous reformuler ?       |
			| Je ne suis pas sûr de comprendre. Pourriez-vous préciser votre demande ?   |
			| Hmmm, cela dépasse mes compétences. Pouvez-vous poser une autre question ? |