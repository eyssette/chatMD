@core @asUser
Feature: Cliquer sur le bouton de menu sous un message
	On peut cliquer sur un bouton de menu sous un message du chatbot pour accéder
	à l'historique de sa conversation ou à un lien vers un message particulier

	Background:
		Given Je lance ChatMD "#dissertation-philo"
		And Je clique sur le bouton "Comment on organise son temps ?"
		And Je clique sur le bouton "Comment on rédige ?"
		And Je clique sur le bouton "Comment on rédige la conclusion ?"
		When Je clique sur le bouton de menu du dernier message

	Scenario: Voir le lien vers l'historique et le titre du dernier message
		Then Je vois une fenêtre modale avec un lien vers l'historique de la conversation "c:n1|c:n6|c:n9"
		And Je vois une fenêtre modale avec un lien vers le titre du dernier message "Rédiger conclusion"

	Scenario: Fermer la fenêtre modale en cliquant en dehors
		Then Je clique en dehors de la fenêtre modale
		Then La fenêtre modale n'est plus visible
	
	Scenario: Fermer la fenêtre modale en cliquant sur le bouton de fermeture
		Then Je clique sur le bouton de fermeture de la fenêtre modale
		Then La fenêtre modale n'est plus visible

	Scenario: Fermer la fenêtre modale en appuyant sur la touche Échap
		Then J'appuie sur la touche "Escape"
		Then La fenêtre modale n'est plus visible