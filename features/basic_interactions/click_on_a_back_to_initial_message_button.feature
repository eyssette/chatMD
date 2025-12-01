Feature: Cliquer sur un bouton "Retour au message initial"
	On peut cliquer sur un bouton "Retour au message initial" pour revenir
	au message initial du chatbot et recommencer une nouvelle conversation

	Scenario: Cliquer sur le bouton "Retour au message initial"
		Given Je lance ChatMD "raw.md"
			"""
			# Faire un gâteau

			<section class="unique">
			Ce chatbot vous permet de choisir une recette. Laissez-vous guider par ce chatbot !
			</section>

			Quel gâteau voulez-vous faire ?

			<section class="unique">
			:::info
			Ce chatbot a été créé par M. Cuisine
			:::
			</section>

			1. [Un gâteau à la banane](Banane)
			2. [Un gâteau à la poire](Poire)

			## Banane

			La recette : …

			1. [Retour au menu initial]()

			## Poire

			La recette : …

			2. [Faire un autre gâteau !]()
			"""
		When Je clique sur le bouton "Un gâteau à la banane"
		And Je clique sur le bouton "Retour au menu initial"
		Then Le chatbot répond "Quel gâteau voulez-vous faire ?"
		And Le dernier message ne contient pas "Ce chatbot vous permet de choisir une recette. Laissez-vous guider par ce chatbot !"
		And Le dernier message ne contient pas "Ce chatbot a été créé par M. Cuisine"