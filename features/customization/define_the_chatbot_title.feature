@core @asCreator @WIP
Feature: Définir le titre de son chatbot
	Le titre h1 en Markdown du fichier source est automatiquement transformé en titre h1 du chatbot généré

	Scenario: Utiliser le titre h1 de son fichier en Markdown pour définir le titre h1 du chatbot
		Given J'utilise un fichier source de base pour mon chatbot
		When Le titre de niveau 1 en Markdown de mon fichier source est “Mon titre personnalisé”
		Then Le titre de mon chatbot est “Mon titre personnalisé”