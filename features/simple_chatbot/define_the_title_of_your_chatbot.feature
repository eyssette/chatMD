Feature: Choisir le titre de son chatbot
	On peut choisir le titre de son chatbot avec un titre de niveau 1 dans son fichier source

	Scenario: Choisir le titre de son chatbot avec un titre de niveau 1
		Given Je lance ChatMD "raw.md"
			"""
			# Mon super chatbot
			Ce chatbot est vraiment super !
			"""
		Then Le titre du chatbot est "Mon super chatbot"

	Scenario: Titre par défaut si aucun titre de niveau 1 n'est présent
		Given Je lance ChatMD "raw.md"
			"""
			Ce chatbot n'a pas de titre de niveau 1.
			"""
		Then Le titre du chatbot est "Chatbot"

	Scenario: Le titre du chatbot peut contenir du Markdown
		Given Je lance ChatMD "raw.md"
			"""
			# **Chatbot** avec du _Markdown_
			Ce chatbot a un titre avec du Markdown.
			"""
		Then Le titre du chatbot est "<strong>Chatbot</strong> avec du <em>Markdown</em>"

	Scenario: Le titre du chatbot utilise le premier titre de niveau 1
		Given Je lance ChatMD "raw.md"
			"""
			# Premier titre
			Ce chatbot a plusieurs titres de niveau 1.
			# Deuxième titre
			"""
		Then Le titre du chatbot est "Premier titre"