@core @asUser @naturalLanguageQuestions
Feature: Poser des questions au chatbot en langage naturel
  On peut interagir avec ChatMD en lui posant des questions en langage naturel
  ChatMD peut trouver la bonne réponse qui correspond et répondre ainsi de manière pertinente

  Scenario Outline: Questions sur des sujets couverts par le chatbot
    Given Je lance ChatMD "<source>"
    When Je demande "<question>"
    Then Le chatbot répond "<réponse>"

    Examples:
      | source              | question                                            | réponse                            |
      |                     | quelle est la licence de ChatMD ?                   | Licence MIT                        |
      | #dissertation-philo | Puis-je utiliser un plan thèse antithèse synthèse ? | Ce n'est pas ce qu'il faut faire ! |


  Scenario: Question sur un sujet non couvert par le chatbot
    Given Je lance ChatMD ""
    When Je demande "Qu'est-ce qu'un brachiosaure ?"
    Then Le chatbot répond qu'il ne peut pas répondre à cette question car il n'a pas l'information