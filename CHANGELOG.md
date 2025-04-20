# Changelog

## 6.8.1 (2025-04-20)

### Fix

- chore: npm update
- fix: useLLM / gestion chunks JSON incomplets
- chore: configuration Taskfile

## 6.8.0 (2025-03-28)

### Feat

- feat: section "unique" dans initialMessage qui n'apparaît qu'une fois
- feat: listes de tâches possibles en Markdown

## 6.7.1 (2025-03-28)

### Fix

- fix: admonition / reprise complète du code
- doc: explications pour l'aléatoire dans les variables
- fix(convertLatex): grandes accolades & utilisation de \\ dans une expression Latex

## 6.7.0 (2025-02-05)

### Feat

- feature: possibilité d'avoir de l'aléatoire dans les variables dynamiques

## 6.6.1 (2025-02-04)

### Fix

- Possibilité de ne pas avoir de titre 2 (si on utilise useLLM always)
- server.js : refactor + restriction allowedFiles
- Admonitions: gestion admonitions sans titre et admonitions imbriquées

## 6.6.0 (2024-12-16)

### Feat

- bouton copyCode: copie dans presse-papier contenu bloc "pre"

### Fix

- dossier addOns distingué de externals
- config corsProxy : changement URL

## 6.5.1 (2024-12-08)

### Fix

- paramètre !loop dans !Next
- extension Showdown: allowInternalLinksWithSpaces

## 6.5.0 (2024-12-05)

### Feat

- yaml: include (pour répartir la source entre plusieurs fichiers)

## 6.4.2 (2024-12-05)

### Fix

- Fonction : longestCommonSubstringWeightedLength
- function processSelectElements
- fonction getParamsFromURL

## 6.4.1 (2024-11-08)

### Fix

- fix rollup / otherMdFiles : n'excluait pas le fichier principal
- Test différent pour arrêt effet machine à écrire
- fix pour directive !SelectNext

## 6.4.0 (2024-11-03)

### Feat

- meilleure gestion événements / autoscroll avec manageScrollDetection

### Fix

- réécriture fonction showdownExtensionAdmonitions
- fonction formatSlowContent

## 6.3.0 (2024-10-26)

### Feat

- utilisation de !useLLM dans une réponse
- Amélioration du calcul de similarité
- Possibilité d'utiliser des mots-clés négatifs

## 6.2.0 (2024-09-17)

### Feat

- chiffrement possible de la clé API

### Fix

- Explications pour les attributs génériques
- prettier onSave: que pour le javascript

## 6.1.0 (2024-09-06)

### Feat

- markdown: ajout des attributs génériques {.class}

## 6.0.2 (2024-08-24)

### Fix

- prettier showdown
- add emojis
- favicon : au format svg

## 6.0.1 (2024-08-11)

### Fix

- première config ESlint
- formattage code avec Prettier
- ESlint: rule quotes (doublequotes)

## 6.0.0 (2024-08-04)

### Feat

- Utilisation des modules + rollup : Merge branch 'test-modules'
- gestion LLM et RAG avec les modules
- minify bundle

## 5.3.1 (2024-07-31)

### Fix

- Définition de variable md via script python à partir des fichiers md dans dossier "data"
- Amélioration gestion directive !Next
- Ajout mode sécurisé

## 5.3.0 (2024-07-20)

### Feat

- gestionOptions : évaluation des expressions plus complexes
- fonction evaluateExpression + sanitizeCode généralisé

### Fix

- Ajout md initial : "Qui a créé ChatMD ?"

## 5.2.0 (2024-07-17)

### Feat

- Gestion directive !Bot: botName

### Fix

- yaml.js / processRAG.js : à part
- directives and special contents : traités à part


## 5.1.1 (2024-07-16)

### Fix

- réorganisation code processComplexDynamicVariables
- Simplification ReadME
- Catch error pour évaluation calc dans variables dynamiques

## 5.1.0 (2024-07-12)

### Feat

- gestion de "calc()" dans variables dynamiques

## 5.0.1 (2024-07-12)

### Fix

- processFixedVariables & convertLatex : à part
- Meilleure structuration + explication Latex + backsticks
- Simplification stopTypeWriter : suppression backsticks

## 5.0.0 (2024-07-10)

### Fix

- changement nom fichier chatdata=&gt;chatbotData
- typo

## 4.5.1 (2024-07-10)

### Fix

- Présentation nouvelles fonctionnalités
- Ajout d'exemples pour les options avancées
- Simplification du script pour combiner fichiers

## 4.5.0 (2024-07-07)

### Feat

- Source chatbot : peut être dans plusieurs fichiers

### Fix

- Commentaires fonctions
- @variable : en cas de valeur non trouvée, 2e passage aussi

## 4.4.0 (2024-07-05)

### Feat

- customVariables =&gt; dynamicVariables

### Fix

- définition de constantes + commentaires code
- constantes pour les regex

## 4.3.0 (2024-07-04)

### Feat

- Amélioration MutationObserver

### Fix

- fix MutationObserver
- Fix Latex pour caractères "&" et "\\ "

## 4.2.0 (2024-07-03)

### Feat

- Liens possibles à l'intérieur du contenu vers une réponse

## 4.1.2 (2024-07-03)

### Fix

- déplacement de fonctions de chatbot.js vers utils.js
- déplacement de fonctions vers markdown.js et nlp.js
- fonction processCustomVariable : à part

## 4.1.1 (2024-06-30)

### Fix

- Meilleure gestion de hideControls (CSS)
- fonction loadCSS : ajout possible de style directement
- Gestion addOn textFit pour éléments en Latex

## 4.1.0 (2024-06-30)

### Feat

- Gestion des addOns + gestion kroki

### Fix

- Changement ordre des constantes : md initial en premier
- CSS position avatar si le message commence par balise "pre"

## 4.0.0 (2024-06-29)

### Feat

- paramètres personnalisables : dans custom.js plutôt que dans chatdata.js

## 3.10.1 (2024-06-29)

### Fix

- format code
- Meilleure gestion des variables dynamiques
- code plus propre (listener click)

## 3.10.0 (2024-06-16)

### Feat

- ContenuDynamique: condition plus complexe possible
- gestion fichiers sur framapad

## 3.9.0 (2024-06-16)

### Feat

- gestion éléments audio autoplay

### Fix

- Meilleure gestion plusieurs réponses possibles
- simplification code: pas de typewriter pr les options en fin de message

## 3.8.1 (2024-06-14)

### Fix

- Fix CSS pour élement "table" juste après ".message"
- Possibilité de mettre les paramètres dans l'URL après le hash
- build script

## 3.8.0 (2024-06-07)

### Feat

- gestion des fichiers hébergés sur Codimd / Hedgedoc / Digipage
- Gestion directive !SelectNext pour sélectionner aléatoirement le prochain message du chatbot
- gestion activation/désactivation clavier cas par cas : fix bug si yamlUserInput = false

## 3.7.1 (2024-05-29)

### Fix

- Possibilité de récupérer les données RAG via URL du fichier RAG
- simplification fonction readStream
- gestion LLM avec Cohere

## 3.7.0 (2024-05-27)

### Feat

- yamlUseLLMapiKey

### Fix

- Gestion des admonitions sans titres

## 3.6.2 (2024-05-26)

### Fix

- Pour le RAG : separator peut être aussi break ou auto (splitIntoChunks)
- yamlUseLLMmaxTopElements + typos
- getAnswerFromLLM : userPrompt + informations

## 3.6.1 (2024-05-25)

### Fix

- getAnswerFromLLM avec RAGbestMatchesInformation + éventuellement selectedResponse
- yaml pour le RAG
- function topElements

## 3.6.0 (2024-05-25)

### Feat

- calcul des vecteurs de mot pour les informations RAG

### Fix

- fix bug en cas de dynamicContent + customVariable mais noOptions
- tokenize : améliorations

## 3.5.0 (2024-05-23)

### Feat

- useLLM : intégration dans le yaml + gestion paramètre always: true
- useLLM : utilisation de la directive !LLM dans un bouton de réponse

## 3.4.0 (2024-05-22)

### Feat

- Contenu dynamique : possible de conditionner aussi les propositions en fin de message

### Fix

- fix bug stricIdentityMatch en cas de caractère accentué en début ou fin de keyword

## 3.3.0 (2024-05-22)

### Feat

- Ajout paramètre : yamlObfuscate pour cacher le titre des liens

### Fix

- Directive !Next : correspondance stricte avec vérification des bornes de mot
- Directive !Next : calcul du matchScore

## 3.2.0 (2024-05-21)

### Feat

- Gestion de la directive !Next : Titre réponse / message en cas d'erreur

## 3.1.0 (2024-05-21)

### Feat

- Directive "!Select : x" pour sélectionner aléatoirement x propositions de réponse

### Fix

- useLLM : gestion affichage de la réponse dans le chatbot

## 3.0.0 (2024-05-19)

### Feat

- getAnswerFromLLM : premiers tests
- Contenu dynamique : test possible sur plusieurs variables

### Fix

- fix bug: suppression des conditions dans le contenu dynamique après retour sur la même réponse

## 2.17.0 (2024-05-16)

### Feat

- Ajout yamlTypeWriter pour pouvoir désactiver l'effet de machine à écrire

### Fix

- Changement de la manière de parser le Markdown : plus besoin de "&gt; " pour le message initial
- Explications syntaxe + url sur la ForgeEdu


## 2.16.0 (2024-05-14)

### Feat

- Ajout contenu dynamique : assignation de variables et contenus conditionnels dans le chatbot

### Fix

- Remplacement des URLs aeif vers ForgeEdu sur Apps
- fix bug shouldBeRandomized en cas d'absence de propositions en fin de message

## 2.15.0 (2024-05-09)

### Feat

- Possibilité de mettre de l'aléatoire dans l'ordre des propositions en fin de message
- Gestion des fichiers sur Hedgedoc

### Fix

- Explication pour la customisation de l'image du widget

## 2.14.0 (2024-05-03)

### Feat

- CSS pour le widget : petits écrans
- widget: icône message

### Fix

- Ajout des explications pour l'utilisation en tant que widget

## 2.13.0 (2024-05-01)

### Feat

- Ajout chatMD en widget

### Fix

- ajout explications pour la customisation d'un thème
- ajout favicon en svg

## 2.12.0 (2024-04-30)

### Feat

- ajout customisation thème CSS + thème bubble

### Fix

- Meilleure gestion du retour au scroll automatique si scroll vers bas de page
- ajouts de break dans des loops for + fix bug stopTypeWriter

## 2.11.2 (2024-03-26)

### Fix

- gestion des admonitions
- fix bug avatar dans admonition
- CSS : amélioration pour les admonitions (emoji & titre)

## 2.11.1 (2024-03-05)

### Fix

- autoScroll à nouveau si on scrolle vers le bas de la page
- AutScroll : bug écrans tactiles - setTimeOut
- fix scrollWindow

## 2.11.0 (2024-01-16)

### Feat

- openLinksInNewWindow: true

## 2.10.0 (2024-01-16)

### Feat

- add yamlFooter
- simpleLineBreaks & gestion tables en markdown

## 2.9.1 (2023-12-13)

### Fix

- Amélioration écriture du code
- fonction displayMessage
- stopTypeWriter si temps exécution trop lent

## 2.9.0 (2023-11-30)

### Feat

- Possibilité de définir des variables
- Bulles pour les options

## 2.8.0 (2023-11-30)

### Feat

- userInput fixed bottom + scroll automatique
- MutationObserver plutôt que DOMNodeInserted

### Fix

- Explication: sélection aléatoire d'une version

## 2.7.0 (2023-11-30)

### Feat

- Personnalisation possible de l'avatar
- Personnalisation possible du message par défaut

## 2.6.0 (2023-11-29)

### Feat

- Choix parmi plusieurs réponses aléatoires

### Fix

- fix: onComplete remove listener
- Affichage immédiat des options en bas de message

## 2.5.0 (2023-11-19)

### Feat

- Enter pour supprimer l'effet machine à écrire

### Fix

- Change build task
- Fix ReadME

## 2.4.0 (2023-11-06)

### Feat

- gestion des shortcuts

### Fix

- yaml titresRéponses : array plutôt que string
- gestion plusieurs expressions Latex

## 2.3.0 (2023-10-30)

### Feat

- Customisation titres réponses dans le yaml
- liens dans le footer

### Fix

- accessibilité

## 2.2.2 (2023-10-26)

### Fix

- Latex: Meilleure gestion avec Katex

## 2.2.1 (2023-10-26)

### Fix

- Améloration test similarité
- fix: pas d'appel à MathJax si yamlMaths ≠ true
- ajout keywords

## 2.2.0 (2023-10-26)

### Feat

- Prise en charge Latex

### Fix

- matchScore plus grand si keywords plus longs

## 2.1.1 (2023-10-25)

### Fix

- README: exemples, options, crédits
- suppression styles inutiles
- accessibilité

## 2.1.0 (2023-10-22)

### Feat

- typewriter: changement de librairie js

## 2.0.2 (2023-10-19)

### Fix

- task : minify js & css
- removeAccents pour les tokens
- minify js & css

## 2.0.1 (2023-10-19)

### Fix

- poids tokens : nouvel algo + bonusInTitle
- vérifie existence de filterBadWords
- Commentaire sur cosineSimilarity

## 2.0.0 (2023-10-19)

### Feat

- Changement nom variable yaml gestion gros Mots
- explication gestion gros mots

## 1.5.0 (2023-10-19)

### Feat

- Gestion des gros mots

### Fix

- optimisation: précalcul vecteurs réponses chatbot
- Ajout de commentaires + typo

## 1.4.0 (2023-10-18)

### Feat

- SearchInContent: cosineSimilarity - tokens+weights
- yaml : possibilité de cacher le champ input
- yaml : possibilité d'ajouter un style CSS perso

## 1.3.0 (2023-10-18)

### Feat

- Algo searchInContent

## 1.2.0 (2023-10-18)

### Feat

- Gestion en-tête yaml

## 1.1.1 (2023-10-18)

### Fix

- Format code
- Ajout de commentaires
- ajout keywords + à quoi ça sert

## 1.1.0 (2023-10-15)

### Feat

- DefaultMessage : choix au hasard

### Fix

- typos
- Liens vers la forge

## 1.0.0 (2023-10-15)

### Feat

- gitlabci : configuration du déploiement
- Réponse options : via chat et pas seulement lien
- add: ReadME.md
- Ajout de commentaires

## 0.7.0 (2023-10-14)

### Feat

- gestion de l'élément unique

## 0.6.0 (2023-10-14)

### Feat

- Markdown: support emojis + img dimensions

## 0.5.0 (2023-10-14)

### Feat

- gestion des options: clic sur les liens

### Fix

- formatage code
- Explication ChatMD à l'ouverture


## 0.4.0 (2023-10-13)

### Feat

- initialMessage : dans le markdown
- gestion des options en fin de message : affichage
- css: images dans le chat

## 0.3.0 (2023-10-13)

### Feat

- Chatbot dans un fichier en markdown
- Tests pour le typewriter

## 0.2.0 (2023-10-13)

### Feat

- essai réglages levensthein + beautify code
- typeWriter effect
- footer

## 0.1.0 (2023-10-13)

### Feat

- Premier essai data en markdown
- contenteditable pour l'input + premiers styles CSS
- calcul distance mots clés plutôt que include

## 0.0.1 (2023-10-13)

- Base pour le chatbot
- Initial commit
