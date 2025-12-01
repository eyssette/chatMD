@core @asUser
Feature: Contrôler l'effet de machine à écrire
	Par défaut, ChatMD affiche les messages du chatbot avec un effet machine à écrire
	Mais on peut afficher tout d'un coup en appuyant sur la touche Entrée ou sur le bouton "Envoyer"

	@chatbot-base
	Scenario: Appuyer sur la touche Entrée
		Given Je lance ChatMD ""
		And J'appuie sur la touche "Enter"
		Then Le texte de présentation de ChatMD s'affiche d'un coup