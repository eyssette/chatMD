@core @roleIsUser @WIP
Feature: Contrôler l'effet de machine à écrire
	Par défaut, ChatMD affiche les messages du chatbot avec un effet machine à écrire
	Mais on peut afficher tout d'un coup en appuyant sur la touche Entrée ou sur le bouton "Envoyer"

	@chatbot-base
	Example: Appuyer sur la touche Entrée
		Given Je suis sur le site ChatMD
		And J'appuie sur la touche Entrée
		Then Le texte de présentation de ChatMD s'affiche d'un coup

	@chatbot-base
	Example: Appuyer sur le bouton “Envoyer”
		Given Je suis sur le site ChatMD
		And J'appuie sur le bouton “Envoyer”
		Then Le texte de présentation de ChatMD s'affiche d'un coup