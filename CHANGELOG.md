# Changelog

## 7.4.2 (2025-05-06)

### Fix

- **interactions**: si on rentre du contenu dans la zone de textes, ajustement automatique (visibilité du footer) aussi en fonction du nombre de caractères
- **interactions**: ajout de shift+Enter pour retours à la ligne dans userInput
- **interactions**: possibilité d'entrer du contenu sur plusieurs lignes dans la zone de texte
- **build**: correction du chemin pour vérifier la présence d'un fichier index.md

## 7.4.1 (2025-05-05)

### Fix

- **messages**:  directive !Typewriter fonctionne maintenant correctement + désactivation automatique de l'effet typewriter si on utilise un élément HTML select
- **CSS**: résolution d'un problème avec la zone de texte, qui était cachée sur petit écran + footer:false + keyboard:false mais temporairement activée à true avec la variable dynamique @KEYBOARD
- **CSS**: taille éléments “pre” sur petits écrans, et en cas de bloc “pre” en première ligne d'un message du chatbot

### Chore

- ci-template renommé
- correction du lien vers le README en Anglais
- renommage variables pour garder la cohérence de nom "choiceOptions"
- renommage chatbot.optionsLastResponse -> choiceOptionsLastResponse
- renommage fonction responseToSelectedOption -> responseToSelectedChoiceOption

### Docs

- ajout d'un README en anglais

## 7.4.0 (2025-05-04)

### Feat

- **messages**: directive !Typewriter pour activer/désactiver l'effet machine à écrire dans un message

### Fix

- **messages**: selectElements seulement dans le message et pas dans le document en entier

### Chore

- config tâche test pour debug dans l'éditeur
- changement de nom d'une variable (chatData -> chatbotData)

### Refactor

- **core**: chatbotData sous la forme d'un objet structuré plutôt que d'un tableau de données

## 7.3.12 (2025-05-04)

### Fix

- **messages**: processSelectElements: fonction améliorée
- **core** refactor options fonctions, fix messages erreurs LLM, fix displayMessage pour actualiser le contenu d'un message

### Refactor

- **markdown**: modularisation de la gestion des variables dynamiques
- **interactions**: modularisation de findBestResponse.mjs
- noms de fichiers et de fonctions plus explicites (createChatbot, createMessage)

## 7.3.11 (2025-05-04)

### Fix

- **interactions**: processMessageWithChoiceOptions()  : on doit filtrer les options d'après les conditions dynamiques mêmes si dynamicVariables n'existe pas

### Chore

- fichier en double supprimé

### Refactor

- **messages**: on évite la répétition de codes en transférant dans displayMessage la conversion en HTML du Markdown, la gestion des bots multiples et la gestion du Latex
- **messages**: modularisation de la fonction de création de messages : createChatMessage()
- **messages**: waitForKatex dans un module à part
- **interactions**: modularisation de controlEvents
- **ai**: modularisation de api.mjs et renommage en getAnswerFromLLM

## 7.3.10 (2025-05-03)

### Fix

- **markdown**: extractMarkdownAndPrompts retourne useLLM: false s'il n'y a pas de prompts dans le message
- **CSS**: résolution d'un problème pour l'affichage des options de choix
- **CSS**: résolution d'un problème sur les admonitions en première ligne d'un message du chatbot

### Chore

- pas de task build avant de push

### Refactor

- **markdown**: extractMarkdownAndPrompts et processMessageWithPrompts : utilisation d'un tableaux d'objets pour la séquence de contenus en markdown et de prompts
- **markdown**: simplification de processMessageWithPrompt
- **markdown**: déplacement de processAudio dans le dossier "directives"
- **markdown**: refactor fonctions de gestions des messages avec prompts
- **markdown**: fonction processMessageWithPrompts simplifiée
- **markdown**: réorganisation des dossiers et noms de fichiers pour les directives et notamment l'utilisation d'un LLM
- **markdown**: modularisation de la gestion des directives et des blocs particuliers
- **messages**: gestion des messages avec prompt dans un module à part

## 7.3.9 (2025-05-02)

### Fix

- **interactions**: refactoring et modularisation de la fonction principale (getChatbotResponse) et fix pour le RAG
- **chatbot**: detectChoiceOption exclut maintenant aussi les liens mailto: et tel:

### Chore

- configuration debug

## 7.3.8 (2025-05-01)

### Fix

- **chatbot**: les liens vers des URL en http… dans une liste ordonnée ne sont pas pris pour des options de choix du chatbot
- **core**: refactor fonction pour sélectionner la meilleure réponse (selectBestResponse) et utilisation ensuite de createChatMessage pour envoyer la réponse
- **interactions**: allowedTagsInUserInput : seulement la balise “p”
- **core**: résolution problème de dépendance circulaire à cause de createChatMessage

### Refactor

- **interactions**: nom plus explicite pour la fonction qui traite les messages avec options : processMessageWithChoiceOptions

## 7.3.7 (2025-05-01)

### Fix

- **lib**: messages d'erreur plus courts dans la librairie showdown
- **core**: test de l'existence de yaml avant de chercher les propriétés de cet objet
- **interactions**: directive !Next sans conditions (pas de keywords dans la réponse) renvoie directement vers la réponse
- **chatbot**: autorisation des choix d'options avec texte de lien vide "1. [texte]()", car on peut les utiliser pour faire des retours au menu principal

### Refactor

- **interactions**: renommage de "gestionOptions" en "shouldDisplayChoiceOption"
- **interactions**: fonction controlEvents (renommage fonction et dossier)
- **chatbot**: création de initializeChatbot() dans create.mjs plutôt que dans controller.mjs
- **chatbot**: modularisation de create.mjs
- **interactions**:  variable nextMessage intégrée dans l'objet chatbot dans controller.mjs

## 7.3.6 (2025-04-30)

### Fix

- **chatbot**: extractMainContent refactorisé et amélioré
- **chatbot**: extractIntroduction() plus robuste
- **chatbot**: detectChoiceOption plus précis

### Chore

- correction erreurs notifiées par ESlint dans fichiers tests
- gestion ESlint pour éviter les erreurs dans les fichiers tests Jasmine

### Refactor

- **chatbot**: fonctions utilitaires secondaires pour le parse du Markdown déplacées dans parsers/helpers/

### Test

- **chatbot**: ajout de tests pour extractMainContent
- **chatbot**: detectResponseTitles
- **chatbot**: extractMainContent
- **chatbot**: extractInformationsFromInitialMessage
- **chatbot**: extractIntroduction
- **chatbot**: detectChoiceOption

## 7.3.5 (2025-04-29)

### Fix

- **plugins**: déplacement des plugins de "addOns" vers "plugins"

### Chore

- ESlint disable no-undef pour le fichier server.js
- ajout de task "build" avant task "push"
- tests unitaires avant de push
- définition de la tâche "lint" et ajout de cette tâche dans "push"
- insertions de "eslint-disable" inutiles
- correction de la config ESlint
- corrections de petites erreurs notifiées par ESlint
- configuration ESlint pour les fichiers en .mjs
- ajout des sources à vérifier pour la task tests:unit

### Refactor

- **messages**: modularisation plus avancée de display.mjs
- **messages**: modularisation de display.mjs
- **messages**: formatContentStopTypeWriter dans un fichier à part et regex dans constants.mjs
- **shared**: ajout de isFirefoxOnWindows dans constants.mjs
- **shared**:définition des constantes userAgent, isMobile et autoFocus dans constants.mjs
- **shared**:constantes pour les pauses de l'effet machine à écrire, dans un fichier à part
- **shared**:définition des sélecteurs d'éléments HTML dans un fichier à part

## 7.3.4 (2025-04-29)

### Fix

- **utils**: fonction splitHtmlIntoChunks() améliorée
- **config**: ajout de config.defaultPauseTypeWriter (permet aussi d'éviter une dépendance circulaire) et calcul pauseTypeWriterValue et pauseTypeWriterMultipleBots en fonction de config.defaultPauseTypeWriter

### Chore

- ajout de es-check dans les dépendances pour le développement
- ajout de la task "ecma" à la tâche "tests"
- ajout d'une task "ecma" pour vérifier si le code est conforme à ES2018
- changement du nom de la Task de compilation
- plus besoin de désactiver l'erreur "circular dependency" pendant la compilation
- compilation avec ECMA 2018
- typo corrigé sur catch (error)

### Refactor

- **messages**: déplacement dans un module des fonctions pour créer les chunks si on veut accélerer l'effet typewriter
- **chatbot**: fonction detectChoiceOption() pour éviter une dépendance circulaire
- **chatbot**: fonction parseMarkdown modularisée

### Test

- **utils**: chunkWithBackticks et splitHtmlIntoChunks

## 7.3.3 (2025-04-28)

### Fix

- **addons**: définition de badWordsFR seulement si cette constante n'existe pas déjà
- **utils**: gestion des shortcuts avec plusieurs URLs

### Refactor

- **chatbot**: simplification & modularisation de createChatbot()
- **chatbot**: fonction createChatbot() et import defaultMD dans main
- **chatbot**: fonction parseMarkdown() dans un fichier à part
- **markdown**: processYAML() returns yaml

### Test

- **utils**: test pour la fonction normalizeUrl et pour la gestion des urls multiples dans les shortcuts

## 7.3.2 (2025-04-27)

### Fix

- organisation en sous-dossiers de core (architecture MVC)
- task push seulement si le fichier DEBUG n'existe pas
- compilation/minification en ECMA 2015
- amélioration du code pour le fichier de compilation
- amélioration des tâches pour gérer le mode DEBUG
- configuration du débuggage
- ajout de script.min.js.map dans les fichiers autorisés pour le serveur local

### Chore

- restructuration du dossier JS

## 7.3.1 (2025-04-26)

### Fix

- **nlp**: amélioration tokenize
- **nlp**: fonction removeAccents (prise en compte du caractère ù)
- **template-ci**: suppression des dossiers pas nécessaires dans public
- clearInterval le plus tôt possible

### Chore

- **nlp**: export de 2 fonctions
- **nlp**: export de la fonction levenshteinDistance (pour les tests)
- **nlp**: déplacement de nlp.mjs dans utils
- **taskfile**: loop pour tâche de push sur les différents repo
- **commitizen**: prise en compte des commits de type test

### Docs

- README avec liens et précisions usages

### Refactor

- **nlp**: objet pour options de vectorisation
- **nlp**:  hasLevenshteinDistanceLessThan
- handleURL()

### Test

- **nlp**: ajout tests pour nlp.js
- ajout d'un test pour deepMerge()

## 7.3.0 (2025-04-24)

### Feat

- config jasmine & codeceptjs pour tests e2e & unitaires

### Fix

- sanitizeHtml seulement sur l'userInput
- automatisation création steps des tests e2e à partir des fichiers .feature
- organisation des tests dans des sous-dossiers
- lancement des tests en excluant le tag @WIP (Work In Progress)
- **Taskfile**: server:stop même si fail des tests codeceptjs
- configuration de codecept  et task avec serveur local
- serveur local à la racine plutôt que dans app/
- refactor et amélioration de deepMerge()
- **taskfile**: tests en série plutôt qu'en parallèle
- add unit tests utils/urls
- ajout extension .mjs pour les imports
- add unit tests utils/arrays.mjs
- 2 tests désactivés pour objects.mjs
- chemin vers l'application pour le serveur local
- configuration taskfile pour les tests (e2e & unit)
- désactivation de 2 messages d'erreurs Rollup
- changement extension modules en .mjs

### Chore

- organisation des fichiers .feature et steps
- noms des fichiers de tests = noms des features
- suppression de commentaires inutiles
- écriture des features en français
- set root for liveserver
- suppression de tryTo et retryTo dans config codecept
- **Taskfile**: juste le nom du dossier dans APP_FOLDER
- rebuild package-lock.json and script

### Refactor

- réécriture goToNewChatbot
- réécriture getParamsFromURL

## 7.2.3 (2025-04-23)

### Fix

- template CI : copie des fichiers de .build dans public
- template CI : modification suite au déplacement des sources dans app
- template CI : chemin pour les fichiers du widget
- template CI : déplacement du template dans .gitlab
- amélioration gestion footer (hide, setContent, resize)
- amélioration de scrollWindow
- amélioration de hasSentenceEndMark()
- logo.svg transparence du fond
- logo.svg simplifié et minifié
- suppression des pauses dans le contenu si pas d'effet typewriter

### Refactor

- déplacement des fichiers sources dans le dossier "app" et du fichier widget.min.js dans le dossier widget

## 7.2.2 (2025-04-21)

### Fix

- commande pour copier tous les fichiers du dépôt dans public

## 7.2.1 (2025-04-21)

### Fix

- copie tous les fichiers lors du déploiement

## 7.2.0 (2025-04-21)

### Feat

- ajout d'un template gitlab-ci pour déployer ChatMD dans un autre dépôt

### Fix

- gestion du build si pas de index.md dans le dépôt

### Chore

- configuration task bump

## 7.1.0 (2025-04-21)

### Feat

- génération index.md ssi dossier data existe

### Chore

- précision pour les montées de version majeure

## 7.0.1 (2025-04-21)

### Fix

- ajout automatique d'un warning dans le fichier index.md généré à partir du dossier data

### Build

- simplification configuration rollup

### Chore

- pre_bump_hook / task build avant la montée de version
- ajout des types docs, build et style à la configuration de commitizen

## 7.0.0 (2025-04-21)

### Fix

- pas de corsProxy par défaut pour fetch URL
- BREAKING CHANGE: source par défaut = fichier index.md

### Chore

- numéro de version avec commitizen dans package.json et fichier VERSION
- configuration commitizen
- ajout des tags dans la task de push

## 6.8.1 (2025-04-20)

### Fix

- useLLM / gestion chunks JSON incomplets
- gestion du Latex dès le message initial
- displayMessage seulement s'il y a du contenu à afficher
- userInput sanitization
- détection API openAI et simplification clean chunk
- conflit accelerateFactor et pauses dans le Markdown
- gestion markdown dans section unique
- conflit stopTypeWriter et pauseTypewriter
- définition des sources pour task build
- autorisation de encodeURI pour le calcul des expressions complexes
- CSS inline pour first child dans section.unique (sauf si admonition)
- typo

### Chore

- configuration Taskfile
- config task push
- ajout task pour créer un tag avec la date du commit
- npm update
- npx task comme commande principale

## 6.8.0 (2025-03-28)

### Feat

- section "unique" dans initialMessage qui n'apparaît qu'une fois
- listes de tâches possibles en Markdown

## 6.7.1 (2025-03-28)

### Fix

- fix: admonition / reprise complète du code
- fix(convertLatex): grandes accolades & utilisation de \\ dans une expression Latex
- fix(convertLatex): test préalable si katex est chargé
- fix(yaml.responsesTitles): conversion array+parse
- fix admonition sur page d'accueil
- fix: admonitions avec &lt;br /&gt;
- fix: suppression du BESTMATCH_THRESHOLD
- fix: gestion erreur si URL ≠ fichier Markdown
- fix(processDynamicVariables): cas où on teste ==undefined
- fix: cas où addOns&gt;2
- fix: CSS admonition au début d'un message
- widget: allowFullScreen
- widget: allow-same-origin (fix: problème avec iframe)

### Docs

- Explications pour l'aléatoire dans les variables
- Ajout de mots clefs
- fix(docs): Variables dynamiques / backticks

### CI

- ci: ajout de tous les fichiers svg

### Chore

- Ajout fichier CONTRIBUTING
- template issue bug : simplification
- add template issue: suggestion
- template service desk


## 6.7.0 (2025-02-05)

### Feat

- feature: possibilité d'avoir de l'aléatoire dans les variables dynamiques

## 6.6.1 (2025-02-04)

### Fix

- Possibilité de ne pas avoir de titre 2 (si on utilise useLLM always)
- server.js : refactor + restriction allowedFiles
- Admonitions: gestion admonitions sans titre et admonitions imbriquées
- version plus sécurisée de server.js
- useLLM / fonction readStream : gestion des erreurs potentielles
- CSS thème bubbles: z-index footer
- useLLM : support ollama & cohere v2
- fix fonction readStream pour safari/iOS
- clé API dans .env utilisable dans server.js
- fonction processMessagesSequentially : gestion des erreurs potentielles
- fonction goToNewChatbot + champ input dans page accueil pour coller URL chatbot et l'ouvrir
- intégration katex : plus de CDN
- feat: add template issue bug report
- styles CSS format + build
- Admonition collapsible : pas d'effet typewriter
- Refactor: replace ?. with explicit conditional checks
- accessibilité du champ pour écrire son message
- Admonitions: gestion type spoiler + fix si pas de titre & imbrication
- gestion admonitions sans titres
- widget : amélioration CSS pour petits écrans
- Suppression code inutile
- maxProcessingTime : configurable dans le yaml
- limite de temps pour la production d'une réponse par un LLM
- input openNewChatBot : amélioration apparence sur petit écran
- Tutoriel : précisions pour activation/désactivation clavier & typewriter
- fix pour ollama
- Admonitions : fix position avatar quand admonition = 1er contenu d'un message
- API Ollama : fix pour la vérification de la fin du flux
- amélioration input openNewChatbot
- copyCode: double retour à la ligne =&gt; simple retour
- Widget: CSS: amélioration padding iframe
- Suppression des backticks s'il n'y a pas d'effet typewriter
- Suppression des balises HTML dans le titre
- CSS: iframe max-width
- processDynamicVariables: pas besoin de lookbehind dans regex (compatibilité plus large)
- copyCode: suppression zero-width space
- fix: gestion retours à la ligne windows
- widget: allow popups
- widget: iframe sandbox
- CSS thème bubbles: margin-bottom h1
- fix gitlab-ci : copie du dossier addOns
- Amélioration accessibilité champ message
- Accessibilité bouton "envoyer" : précision type
- logo chatMD

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
- Fix clic bouton avec HTML ou Latex
- Ajustement MATCH_SCORE_IDENTITY
- createChatMessage : soit création d'un div, soit contenu dans un élément choisi
- noBackticks si le message est de l'utilisateur
- noBackticks si le message provient d'un LLM
- fix pour !SelectNext
- Audio : gestion "autoplay+loop"
- processDynamicVariables dans message initial : inutile
- Fix pour les tableaux en markdown
- modif doc pour source avec plusieurs fichiers
- fix: footer / sendButton
- typo
- fix Latex : oubli convertLatexExpressions !
- const MATCH_SCORE_IDENTITY : ajustement
- option noBackticks pour convertLatexExpressions

## 6.4.1 (2024-11-08)

### Fix

- fix rollup / otherMdFiles : n'excluait pas le fichier principal
- Test différent pour arrêt effet machine à écrire
- fix pour directive !SelectNext
- Amélioration fonction scrollWindow (smooth ou auto)
- contenu par défaut : petites corrections & ajouts
- scrollWindow : gestion scrollToBottomOfPage
- test si stop typewriter : minCharLength plus petit
- scrollToBottomOfPage : ajout constante pour être sûr d'être en bas de page
- Accélération par défaut pour Firefox sur Windows
- editorconfig & gitattributes
- similarité sur les keywords : sans les accents
- test similarité keyword/réponse : seulement pour des mots suffisament longs
- CSS main : margin-bottom plus importante
- accélération par défaut plus importante pour Firefox/Windows
- fichier "jetons" supprimés

## 6.4.0 (2024-11-03)

### Feat

- Possibilité d'accélerer l'effet machine à écrire en affichant N caractères à chaque fois

### Fix

- meilleure gestion événements / autoscroll avec manageScrollDetection
- réécriture fonction showdownExtensionAdmonitions
- fonction formatSlowContent
- fonction stopTypeWriter définie avant
- Si clavier désactivé : Bouton "Afficher tout" plutôt que "Envoyer"
- commentaires code
- Directive !Next: inclusion du titre dans keywords s'il n'y a pas de keywords
- test keyword négatif : avant test identité stricte (pas besoin de le faire si c'est le cas)
- fix pour directive !Next (test bestMatch &gt; BESTMATCH_THRESHOLD)
- hideFooter() : prise en compte désactivation clavier
- directive !Next: on n'inclut pas le titre dans les keywords
- fix directive !Next (suite : généralisation test sur bestMatchScore)
- yaml.typewriter : majuscule pas obligatoire à Writer
- rename : formatSlowContent =&gt; formatContentStopTypeWriter
- ajout scrollWindow() à la fin de stopTypeWriter()
- format code

## 6.3.0 (2024-10-26)

### Feat

- utilisation de !useLLM dans une réponse
- Possibilité d'utiliser des mots-clés négatifs
- Ajout de yaml.avatarCircle
- gestion fichiers hébergés sur pad gouv

### Fix

- Amélioration du calcul de similarité
- fix : définition de bodyObject
- hideControls : on garde button Envoyer (pour afficher suite)
- Ajout de " …" si le stream du LLM ne termine pas la phrase
- meilleure définition des constantes pour le calcul de similarité
- converstion stream LLM : Markdown =&gt; HTML
- fixImageDimensionsCodiM
- HTML dans le titre possible
- bonusLengthSimilarity
- WORD_LENGTH_FACTOR * 3 pour calcul similarity
- Pas de trim dans le message initial
- Léger abaissement seuil BESTMATCH_THRESHOL
- shortcut chatbot orientation
- typos
- defaultMaxTokens : 300

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
- utils : répartition en dossiers
- minify css
- gestion RAG : useFile ou directement dans yaml
- réinitialisation à zéro fichier RAG
- config serveur html en local
- js-yaml: import seulement de "load"
- LLM : utilisation variable environnement
- typeWriter: scrollWindow seulement si observerConnected
- création des dossiers avant copie des fichiers
- fix message error yaml: yaml.utiliserLLM.url
- copie seulement les fichiers nécessaires dans "public"
- Prettier: formatOnSave
- favicon.ico remplacée par favicon.svg
- Nom fichier: markdown.js =&gt; markdownToHTML.js
- import config

## 6.0.1 (2024-08-11)

### Fix

- première config ESlint
- formattage code avec Prettier
- ESlint: rule quotes (doublequotes)
- ajout semicolons manquant
- ESlint: espaces / arrays & objects
- Organisation en dossiers des scripts js
- ESlint: fix indent
- ESlint: space-infix-ops
- ESlint: no-multi-spaces + no-trailing-spaces
- ESlint: suppression caractère échappement inutile
- ajout de semicolons
- ESlint: no-duplicate-imports
- ESlint fichier rollup config + rename fonction
- suppression variables inutiles
- variable COMPRESS_FILES + ajout .svg
- simplification variable FILES_TO_COMPRESS : utilisation boucle
- simplification variable COMPRESS_FILES
- ESlint: ajout rule semicolon
- ESlint: / blocks
- ESlint: ajout exceptions / certaines règles
- compression fichiers : ajout .ico
- main script = script.min.js
- fix error escape characters

## 6.0.0 (2024-08-04)

Montée de version majeure : refactoring important du code avec la modularisation et l'utilisation de rollup pour la compilation

### Feat

- Utilisation des modules + rollup : Merge branch 'test-modules'

### Fix

- gestion LLM et RAG avec les modules
- minify bundle
- fix errors import/export
- fix showdown en tant que module
- ajout minification CSS ds config rollup
- Combinaison des fichiers md dans une variable defaultMD
- définition variables & fonctions pour import/export
- Définition tâche de build avec npm & rollup
- changements noms dossiers
- suppression code inutile
- fix problème footer
- organisation propriétés YAML
- script.min.js à la place de bundle.js
- condition yaml.addOns pour processKroki : dans chatbot.js
- deepMerge pour ajouter yamlData à yaml
- gestion propriétés booléennes yaml vraies par défaut : userInput & typewriter
- sort lines yaml
- yaml : propriétés FR =&gt; verif FR en 1er
- minify widget avec rollup
- ajout main.js
- Ajout condition yaml.bots pour processDirectiveBot
- test yaml.variables avant processFixedVariables
- condition yaml.bots avant processMultipleBots
- utilisation de rules
- ajout fichiers md dans la compression
- fix calcul chatDataLength : après chatData.pop
- ajout brotli car pas installé par défaut
- fix pour defaultMessage: conversion object &gt; array
- Ajout sourcemap pour debug
- dossier "widget"
- remove favicon.svg
- déplacement dossier "themes" dans "css"
- explication pour source répartie entre plusieurs fichiers
- simplification description ChatMD
- import fichier md comme variable avec rollup-plugin-string
- fix sanitizeCode : autorisation parenthèses

## 5.3.1 (2024-07-31)

### Fix

- Définition de variable md via script python à partir des fichiers md dans dossier "data"
- Amélioration gestion directive !Next
- Ajout mode sécurisé
- constantes aLength et bLength
- fix: définition de certaines variables
- utilisation de .test plutôt que .match
- lien dans footer : sans couleur
- constante chatDataLength
- Explications pour source répartie entre plusieurs fichiers
- constante arrayLength
- constante wordsLength
- constante optionsLength
- constante informationsLength

## 5.3.0 (2024-07-20)

### Feat

- gestionOptions : évaluation des expressions plus complexes
- fonction evaluateExpression + sanitizeCode généralisé
- Plusieurs bots peuvent répondre dans un message

### Fix

- Ajout md initial : "Qui a créé ChatMD ?"
- Explication gestion plusieurs bots (directive !Bot & yaml)
- messageIfErrorWithGetAnswerFromLLM + commentaires code
- amélioration README : crédits
- directive !Bot : seulement si !isUser
- pauseTypeWriterMultipleBots : pause entre bots
- md initial: Précision sources et licence libre
- script pour widget : sur une seule ligne
- style CSS pour multiple bots
- Ajout "&lt;" et "&gt;" sans espaces avant comme opérations autorisées dans blocs "if"
- typo framapad
- Changement thresholdMouseMovement : 5 à 10
- Explication: plusieurs bots qui se répondent successivement
- widget: z-index 999
- simplification footer

## 5.2.0 (2024-07-17)

### Feat

- Gestion directive !Bot: botName

### Fix

- yaml.js / processRAG.js : à part
- directives and special contents : traités à part
- fix directive Next (counter remis à 0) + nommage variables

## 5.1.1 (2024-07-16)

### Fix

- réorganisation code processComplexDynamicVariables
- Simplification ReadME
- Catch error pour évaluation calc dans variables dynamiques
- Message d'erreur si LLM pas configuré
- ajout mots clés
- fix pour @KEYBOARD
- sanitizeCode pour calc dans dynamicVariables
- gestion de calc pour les variables dynamiques dans les boutons
- gestion aléatoire avec --- : à faire avant dynamicVariables
- CSS: hideControls & hideFooter
- placeholder CSS & message pour petits écrans
- sendButton: clic sans input simule keypress "Enter"
- CSS placeholder très petits écrans
- CSS footer amélioré si hideControls
- hideFooter ssi yamlFooter==true
- Explications pour calc()
- syntaxe assignation variable (préférable sans espace)
- typo "opérations autorisées"
- CSS .hideControls footer
- Ajout ?both sur un exemple codiMD
- fix bug lien "contenus particuliers"
- gestion source sur Digidoc
- &lt;= et &gt;= autorisés dans les blocs conditionnels
- fix bug framapad : pas besoin de corsProxy
- ajout commentaire Digidoc
- fix pour tryConvertStringToNumber si input = number

## 5.1.0 (2024-07-12)

### Feat

- gestion de "calc()" dans variables dynamiques

## 5.0.1 (2024-07-12)

### Fix

- processFixedVariables & convertLatex : à part
- Meilleure structuration + explication Latex + backsticks
- Simplification stopTypeWriter : suppression backsticks
- Traitement variables dynamiques : avant les directives & autres contenus
- fonction tryConvertStringToNumber
- Possibilité de changer favicon
- Iframes : pas d'effet typewriter
- footer =&gt; pied de page
- Explication rechercheContenu =&gt; temps chargement
- title : défini par le titre du chatbot
- explication: favicon dans yaml

## 5.0.0 (2024-07-10)

### Fix

- BREAKING CHANGE: changement nom fichier chatdata=&gt;chatbotData
- typo

## 4.5.1 (2024-07-10)

### Fix

- Présentation nouvelles fonctionnalités
- Ajout d'exemples pour les options avancées
- Simplification du script pour combiner fichiers
- CSS: fix pre & admonition
- explication récupération paramètres dans URL
- explication : -(dés)activer clavier pour une réponse
- typo et formulation
- option : Connecter ChatMD à un LLM, faire du RAG
- typo pour explication directive SelectNext
- CSS pre / white-space: pre-wrap
- précisions usages plus complexes
- CSS: a =&gt; word-wrap: break-word
- CSS: styles minifiés
- fix admonition "&lt;/p&gt;" à supprimer
- CSS: fix hover sur options fin message

## 4.5.0 (2024-07-07)

### Feat

- Source chatbot : peut être dans plusieurs fichiers

### Fix

- Commentaires fonctions
- @variable : en cas de valeur non trouvée, 2e passage aussi

## 4.4.0 (2024-07-05)

### Feat

- customVariables =&gt; dynamicVariables
- Traitement des variables dynamiques dans initialMessage

### Fix

- définition de constantes + commentaires code
- constantes pour les regex
- CSS: pre + admonition (petits écrans)
- processVariables =&gt; processFixedVariables

## 4.3.0 (2024-07-04)

### Feat

- Possibilité de customiser le footer

### Fix

- fix MutationObserver
- Amélioration MutationObserver
- Fix Latex pour caractères "&" et "\\ "
- Fix: liens à l'intérieur du contenu vers une réponse

## 4.2.0 (2024-07-03)

### Feat

- Liens possibles à l'intérieur du contenu vers une réponse

## 4.1.2 (2024-07-03)

### Fix

- déplacement de fonctions de chatbot.js vers utils.js
- déplacement de fonctions vers markdown.js et nlp.js
- fonction processCustomVariable : à part
- fonction typewriter à part
- fonction displayMessage dans typewriter.js
- déplacement de fonctions de chatdata vers utils
- fonction hideFooter
- thème bubbles: simplification & minification CSS
- fonctions communes dans utils + processVariables: preprocess possible
- structuration avec des dossiers
- 2e passage pr remplacer variables par valeurs ssi hasComplexVariable
- Optimisation pour le Latex avec l'effet typeWriter
- preprocess variables : suppression variable ssi lastMatch
- Fix: indices avec le Latex (conflit avec "em")
- URLs actualisés dans widget
- fix typewriter mutationObserver
- fix: pas de processVariables si pas de yamlData
- fix nextMessage dans utils

## 4.1.1 (2024-06-30)

### Fix

- Meilleure gestion de hideControls (CSS)
- fonction loadCSS : ajout possible de style directement
- Gestion addOn textFit pour éléments en Latex
- Ajout automatique de textFit si yamlData.maths
- LLM apiKey : intégration possible dans yaml
- Optimisation du Latex : span class (p)strut
- Optimisation pour Latex (mathml =&gt; affichage d'un coup)
- fix pour stopTypeWriter avec le Latex

## 4.1.0 (2024-06-30)

### Feat

- Gestion des addOns + gestion kroki

### Fix

- Changement ordre des constantes : md initial en premier
- CSS position avatar si le message commence par balise "pre"
- Aléa: split avec \n---\n =&gt; fix tableaux inutile
- Traitement propriétés YAML : ajout condition startsWith("---")
- fix: pas besoin d'ajouter \n en fin de ligne
- CSS images : maxWidth 100%

## 4.0.0 (2024-06-29)

### Feat

- BREAKING CHANGE: paramètres personnalisables dans custom.js plutôt que dans chatdata.js

## 3.10.1 (2024-06-29)

### Fix

- format code
- Meilleure gestion des variables dynamiques
- code plus propre (listener click)
- fix bug en cas de dynamicContent + pas d'options
- amélioration CSS quand keyboard : false
- Meilleure gestion de la désactivation du clavier
- Possible pas de titres 1 & 2 ss erreurs
- fix bug calcul conditionnement variable
- Fix: retours à la ligne conservé dans "pre" si stopTypeWriter
- typos + meilleure gestion source sur forge
- Directive !Next : passer à la suite après 3 essais
- Simplification code : chatbotTitleMatch
- Meilleure gestion directive !Next
- fix / mutationObserver
- Possibilité aléatoire parmi variables fixes
- improve: options fin / apparaissent d'un coup
- Add color a : prevent Blink
- Réinitialisation après bonne réponse pour !Next
- Nettoyage du message envoyé (suppression lignes vides)
- Enter / stopTypeWriter : code plus propre
- gestion conflit yamlObfuscate & !useLLM
- gestion des variables fixes : en amont
- Yaml: useLLM / ajout preprompt & postprompt
- pas de focus sur portable
- léger timeout pour scrollWindow
- Optimisation conditionnement variable
- pas de corsProxy pour fichiers sur la forge
- Widget: URL_SOURCE_CHATBOT plutôt que URL_DE_VOTRE_CHATBOT
- fix display keyboard : flex
- stopTypeWriter : ligne par ligne
- fix bug conflit !Next et contenuDynamique
- Fix tableaux en Markdown / conflit avec '---'
- fix conflit entre !Next et yamlObfuscate
- Fix pour les tableaux : plus général
- typo (point final + virgules qui manquaient)
- Message askAPIkey plus clair
- fix blink sur a:visited
- no width space sur exemple du séparateur
- contenu conditionnel: !=, &gt; et &gt; autorisés
- new Function plutôt que eval : plus sécurisé
- handleMutation: fix incrémentation counter
- ajout remerciement
- fix bug typewriter stop / enter

## 3.10.0 (2024-06-16)

### Feat

- ContenuDynamique: condition plus complexe possible
- gestion fichiers sur framapad

## 3.9.0 (2024-06-16)

### Feat

- gestion éléments audio autoplay
- Gestion audio avec directive !Audio

### Fix

- Meilleure gestion plusieurs réponses possibles
- simplification code: pas de typewriter pr les options en fin de message
- ajout pauseTypeWriter avant options

## 3.8.1 (2024-06-14)

### Fix

- Fix CSS pour élement "table" juste après ".message"
- Possibilité de mettre les paramètres dans l'URL après le hash

## 3.8.0 (2024-06-07)

### Feat

- gestion des fichiers hébergés sur Codimd / Hedgedoc / Digipage
- Gestion directive !SelectNext pour sélectionner aléatoirement le prochain message du chatbot
- gestion activation/désactivation clavier cas par cas : fix bug si yamlUserInput = false
- Possibilité de désactiver le clavier pour un choix particulier avec @KEYBOARD = false
- Récupération des paramètres de l'URL dans customVariables

## 3.7.1 (2024-05-29)

### Fix

- Possibilité de récupérer les données RAG via URL du fichier RAG
- simplification fonction readStream
- gestion LLM avec Cohere
- unification fonction readStream pour intégrer API Cohere
- handleURL() : pour les fichiers RAG aussi
- handleURL : gestion corsProxy
- gestion de &lt; et &gt; dans les expressions Latex
- fix: readStream() en cas ordinaire

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
- Fichier pour faire du RAG

## 3.6.1 (2024-05-25)

### Fix

- getAnswerFromLLM avec RAGbestMatchesInformation + éventuellement selectedResponse
- yaml pour le RAG
- function topElements
- Calcul RAGbestMatchesInformation
- Si click sur un lien dans lequel il y a !useLLM, on renvoie tout de suite après la réponse du chatbot

## 3.6.0 (2024-05-25)

### Feat

- calcul des vecteurs de mot pour les informations RAG

### Fix

- fix bug en cas de dynamicContent + customVariable mais noOptions
- tokenize : améliorations
- fix style : pre
- typo sur le token correspondant au mot entier

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
- directive !Select : on vérifie qu'on sélectionne &lt;= nombre d'options disponibles
- simplification pour messageIfKeywordsNotFound

## 3.2.0 (2024-05-21)

### Feat

- Gestion de la directive !Next : Titre réponse / message en cas d'erreur

## 3.1.0 (2024-05-21)

### Feat

- useLLM : gestion affichage de la réponse dans le chatbot
- Directive "!Select : x" pour sélectionner aléatoirement x propositions de réponse

## 3.0.0 (2024-05-19)

Montée de version majeure : ChatMD peut maintenant se connecter à un LLM

### Feat

- getAnswerFromLLM : premiers tests
- Contenu dynamique : test possible sur plusieurs variables

### Fix

- fix bug: suppression des conditions dans le contenu dynamique après retour sur la même réponse
- leo-profanity : script en local
- typo

## 2.17.0 (2024-05-16)

### Feat

- Changement de la manière de parser le Markdown : plus besoin de "&gt; " pour le message initial
- Ajout yamlTypeWriter pour pouvoir désactiver l'effet de machine à écrire
- Ajout du titre complet dans les keywords pour la sélection d'une réponse

### Fix

- Explications syntaxe + url sur la ForgeEdu
- Suppression titres 1 dans le contentAfterFirstPart s'il y en a
- URL des sources : vers le groupe ChatMD

## 2.16.0 (2024-05-14)

### Feat

- Ajout contenu dynamique : assignation de variables et contenus conditionnels dans le chatbot

### Fix

- Remplacement des URLs aeif vers ForgeEdu sur Apps
- fix bug shouldBeRandomized en cas d'absence de propositions en fin de message
- Explications pour l'affichage aléatoire des propositions en fin de message

## 2.15.0 (2024-05-09)

### Feat

- Possibilité de mettre de l'aléatoire dans l'ordre des propositions en fin de message
- Gestion des fichiers sur Hedgedoc

### Fix

- Explication pour la customisation de l'image du widget
- ajout de remerciements

## 2.14.0 (2024-05-03)

### Feat

- widget: icône message
- widget : customisation possible de l'image

### Fix

- Ajout des explications pour l'utilisation en tant que widget
- CSS pour le widget : petits écrans
- adresse image favicon : URL absolue
- Ajout de "Comment utiliser ChatMD en tant que widget ?"

## 2.13.0 (2024-05-01)

### Feat

- Ajout chatMD en widget
- ajout explications pour la customisation d'un thème
- ajout favicon en svg

## 2.12.0 (2024-04-30)

### Feat

- ajout customisation thème CSS + thème bubble

### Fix

- Meilleure gestion du retour au scroll automatique si scroll vers bas de page
- ajouts de break dans des loops for + fix bug stopTypeWriter
- fix bug handleMutation : tester seulement 1 fois le temps d'éxecution
- ajout attribution chatbot microscope
- join inutile

## 2.11.2 (2024-03-26)

### Fix

- gestion des admonitions
- fix bug avatar dans admonition
- CSS : amélioration pour les admonitions (emoji & titre)
- add: gitignore

## 2.11.1 (2024-03-05)

### Fix

- autoScroll à nouveau si on scrolle vers le bas de la page
- AutScroll : bug écrans tactiles - setTimeOut
- fix scrollWindow
- problème de scroll avec iframe =&gt; venait de focus()
- fix : scrollWindow quand chatMD est dans une iframe
- fix: bug Autoscroll écrans tactiles
- autoScroll à nouveau si scroll vers bas de la page (pour écrans tactiles)
- fonction scrollWindow généralisée
- CSS - background-color: white
- Explications yamlFooter
- typo contentWindow
- autoscroll écrans tactiles : settimeout 500
- bug Autoscroll écrans tactiles
- threshold pour le retour de l'autoscroll sur écran tactile
- détection automatique des liens dans le markdown
- minified script

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
- Changement avatar initial
- Ajout d'un usage possible
- si prefers-reduced-motion : pas de typewriter
- hébergement scripts externes
- fix CSS
- Focus automatique userInput : pas sur smartphone
- constante stopTypeWriterExecutionTimeThreshold
- showCursor: false - typeSpeed:0
- Si source sur CodiMD : suppression du # à la fin
- stopTypeWriterExecutionTimeThreshold = 800
- typeSpeed: -5000
- Remerciements Perrine D
- Suppression référence mapping
- fix - commentaires
- linux & osx commands

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
- Focus userInput on document/keypress
- Explication: sélection aléatoire d'une version
- message EnterToStopTypeWriter petits écrans
- Crédits: katex

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
- Explication: Enter stoppe l'effet machine à écrire
- fix : pauseWriter

## 2.5.0 (2023-11-19)

### Feat

- Enter pour supprimer l'effet machine à écrire

### Fix

- Change build task
- Fix ReadME

## 2.4.0 (2023-11-06)

### Feat

- yaml titresRéponses : array plutôt que string
- gestion des shortcuts

### Fix

- fix : gestion plusieurs expressions Latex

## 2.3.0 (2023-10-30)

### Feat

- Customisation titres réponses dans le yaml

### Fix

- Accessibilité
- Liens dans le footer
- keywords
- README: ajout explications "maths: true"

## 2.2.2 (2023-10-26)

### Fix

- Latex: Meilleure gestion avec Katex

## 2.2.1 (2023-10-26)

### Fix

- Amélioration test similarité
- Pas d'appel à MathJax si yamlMaths ≠ true
- Ajout keywords
- Explications prise en charge Latex

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
- commentaires
- focus sur userInput dès que le chatbot répond
- Change description
- Add favicon

## 2.1.0 (2023-10-22)

### Feat

- typewriter: changement de librairie js

## 2.0.2 (2023-10-19)

### Fix

- task : minify js & css
- removeAccents pour les tokens
- minify js & css
- message de départ : options configuration
- add: BESTMATCH_THRESHOLD
- footer: add sources
- typos
- keywords
- attribut lang
- style: contrast footer

## 2.0.1 (2023-10-19)

### Fix

- poids tokens : nouvel algo + bonusInTitle
- vérifie existence de filterBadWords
- Commentaire sur cosineSimilarity

## 2.0.0 (2023-10-19)

### Fix

- BREAKING CHANGE: Changement nom variable yaml gestion gros Mots
- explication gestion gros mots

## 1.5.0 (2023-10-19)

### Feat

- Gestion des gros mots

### Fix

- optimisation: précalcul vecteurs réponses chatbot
- Ajout de commentaires + typo
- explication options de configuration
- messageOptions : nouvel élément ul
- Ajout titres  réponses dans calcul vecteurs

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
- defaultMessage: plus d'aléatoire dans les réponses
- commentaires + une fonction renommée
- css pour les portables
- css portables : fix
- css pour petits écrans
- styles pour petits écrans
- Ajout modèle à récupérer
- plusieurs exemples
- Message initial : défini simplement par "&gt;"
- Garder le focus sur userInput
- meta desription
- Listes ordonnées & paragraphes dans les réponses
- Add keywords
- typos
- add viewport

## 1.1.0 (2023-10-15)

### Feat

- DefaultMessage : choix au hasard

### Fix

- typos
- Liens vers la forge
- suppression définition cache
- gitlab - reset cache
- gitlab-ci : compression des fichiers
- adresse chatbot : sur la forge

## 1.0.0 (2023-10-15)

### Feat

- gitlab-ci : configuration du déploiement

### Fix

- Réponse options : via chat et pas seulement lien
- add: ReadME.md
- Ajout de commentaires
- userInput très court : pas de test de similarité

## 0.7.0 (2023-10-14)

### Feat

- gestion de l'élément unique

## 0.6.0 (2023-10-14)

### Feat

- Markdown: support emojis + img dimensions

## 0.5.0 (2023-10-14)

### Feat

- gestion des options: clic sur les liens
- gestion des liens : ordinaire ≠ starts with #
- gestion des options dans message initial
- css: class unique : afficher seulement 1er élément
- Gestion lien option vide (retour message initial)
- gestion sources sur codiMD ou github
- gestion du md &gt; html dans les réponses
- md initial
- ouverture autre onglet si lien vers un autre chat
- windowScroll

### Fix

- formatage code
- Explication ChatMD à l'ouverture
- windowScroll pour click lien et bouton envoi

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
- Gestion du markdown dans les réponses
- keypress plutôt que keyup

## 0.1.0 (2023-10-13)

### Feat

- Premier essai data en markdown
- contenteditable pour l'input + premiers styles CSS
- calcul distance mots clés plutôt que include
- bestMatch plutôt que match strict avec chaque keyword
- Classe message + scroll automatique bas de page

### Fix

- fix: calcul distance pour préférer match exact
- correspondance en lowerCase + placeholder

## 0.0.1 (2023-10-13)

- Base pour le chatbot
- Initial commit
