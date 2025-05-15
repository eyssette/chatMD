@core @asUser @naturalLanguageQuestions 
Feature: Poser des questions au chatbot en langage naturel
	On peut interagir avec ChatMD en lui posant des questions en langage naturel
	ChatMD peut trouver la bonne réponse qui correspond et répondre ainsi de manière pertinente

  @chatbot-base
  Scenario: Question sur la licence de ChatMD
    Given Je suis sur le site de ChatMD
    When Je demande quelle licence ChatMD utilise
    Then Le chatbot répond que ChatMD est sous licence MIT
  
  @chatbot-philosophyDissertation
  Scenario: Question sur la structure thèse-antithèse-synthèse dans une dissertation de philosophie
    Given J'utilise le chatbot pour la méthodologie d'une dissertation de philosophie
    When Je demande si je peux utiliser une structure thèse-antithèse-synthèse
    Then Le chatbot explique que la structure thèse-antithèse-synthèse n'est pas appropriée pour une dissertation de philosophie
