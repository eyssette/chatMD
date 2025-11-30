@core @asUser @naturalLanguageQuestions 
Feature: Poser des questions au chatbot en langage naturel
	On peut interagir avec ChatMD en lui posant des questions en langage naturel
	ChatMD peut trouver la bonne réponse qui correspond et répondre ainsi de manière pertinente

  @chatbot-base
  Scenario: Question sur la licence de ChatMD
    Given Je lance ChatMD ""
    When Je demande quelle licence ChatMD utilise
    Then Le chatbot répond que ChatMD est sous licence MIT
  
  @chatbot-philosophyDissertation
  Scenario: Question sur la structure thèse-antithèse-synthèse dans une dissertation de philosophie
    Given Je lance ChatMD "#dissertation-philo"
    When Je demande si je peux utiliser une structure thèse-antithèse-synthèse
    Then Le chatbot explique que la structure thèse-antithèse-synthèse n'est pas appropriée pour une dissertation de philosophie

  @chatbot-base
  Scenario: Question sur un sujet non couvert par le chatbot
    Given Je lance ChatMD ""
    When Je pose une question qui n'est pas dans la base de connaissances
    Then Le chatbot répond qu'il ne peut pas répondre à cette question car il n'a pas l'information