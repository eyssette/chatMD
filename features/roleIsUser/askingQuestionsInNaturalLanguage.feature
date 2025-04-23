@core @naturalLanguageQuestions
Feature: Getting relevant answers from the chatbot using natural language
  In order to get information from the chatbot
  As a user
  I want to be able to ask a question in natural language, with keywords, and receive the accurate answers

  @chatbot-base
  Scenario: Asking a question about the license of ChatMD
    Given I am on the ChatMD website
    When I ask what license ChatMD uses
    Then The chatbot answers that ChatMD is licensed under the MIT licence
  
  @chatbot-philosophyDissertation
  Scenario: Asking a question about the thesis-antithesis-synthesis structure in a philosophy dissertation 
    Given I'm using the chatbot about the methodology for a philosophy dissertation
    When I ask if I can use a thesis-antithesis-synthetis structure
    Then The chatbot explains that the thesis-antithesis-synthesis structure is not appropriate for a philosophy dissertation