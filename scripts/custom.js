let md = `---
gestionGrosMots: true
---
# ChatMD

Bonjour, je suis **ChatMD**, un outil libre et gratuit qui permet de créer facilement un chatbot personnalisé à partir d'un simple fichier en Markdown.

:::info C'est très simple !
1. Créez un fichier en Markdown accessible en ligne.
2. Respectez la syntaxe de ChatMD pour définir votre chatbot.
3. Votre chatbot est alors accessible à l'adresse suivante : [https://chatmd.forge.apps.education.fr/#URL](https://chatmd.forge.apps.education.fr/#URL) <br>(Mettez l'url de votre fichier à la place de URL) !
:::

On peut imaginer **de nombreux usages** :
- Tutoriel pour un outil informatique
- Guide méthodologique
- Soutien pour la révision d'un cours, quiz interactif,
- Discussion avec un personnage historique,
- Histoire dont vous êtes le héros …

La syntaxe de base est simple, mais ChatMD peut être configuré pour des **usages plus complexes** : personnalisation de l'interface, utilisation de variables, de choix aléatoires, intégration avec un LLM, possibilité de faire du RAG …

1. [Qu'est-ce que le Markdown ?](Markdown)
2. [Comment créer un fichier en Markdown accessible en ligne ?](Comment créer un fichier en Markdown accessible en ligne ?)
3. [Quelle syntaxe faut-il respecter pour ChatMD ?](Syntaxe)
4. [Donne-moi des exemples !](Exemples)
5. [Quelles sont les options de configuration plus avancées ?](Options de configuration)
6. [Comment intégrer mon chatbot dans un site ?](Comment intégrer mon chatbot sur un site ?)

## Markdown
- markdown

Le Markdown est un format de balisage très léger qui permet d'écrire rapidement du texte formaté.

Par exemple on écrit \`**texte en gras**\` pour écrire du **texte en gras**, ou alors \`_texte en italique_\` pour écrire du _texte en italique_.

Pour découvrir le Markdown, vous pouvez suivre ce [tutoriel](https://www.markdowntutorial.com/fr/).

1. [OK, j'ai compris ce qu'est le Markdown, mais comment créer un fichier en Markdown accessible en ligne ?](Comment créer un fichier en Markdown accessible en ligne ?)
2. [J'ai compris la syntaxe du Markdown, mais quelle est la syntaxe à respecter pour ChatMD ?](Syntaxe)

## Comment créer un fichier en Markdown accessible en ligne ?
- codimd
- codi
- forge
- en ligne
- digipage
- hedgedoc
- framapd

Il existe plusieurs services pour créer un fichier Markdown accessible en ligne.

Si vous êtes prof en France et que avez des identifiants académiques, vous pouvez utiliser [CodiMD](https://codimd.apps.education.fr/) sur le [portail Apps Edu](https://portail.apps.education.fr/).

D'autres outils fonctionnent avec ChatMD et notamment : [Digipage](https://digipage.app/) de La Digitale et [Framapad](https://framapad.org/) de Framasoft

Il est également possible d'utiliser la [Forge des Communs Numériques Éducatifs](https://forge.apps.education.fr/).

1. [Qu'est-ce qu'une forge ?](forge)
2. [J'ai compris comment créer mon fichier, mais quelle est la syntaxe à respecter pour ChatMD ?](Syntaxe)

## forge

Une forge est un outil qui permet d'héberger des fichiers texte et de les transformer en site web, en carte mentale, ou encore ici en chatbot ! ChatMD est présent sur la [Forge des Communs Numériques Éducatifs](https://forge.apps.education.fr/) et vous pouvez aussi mettre vos fichiers sur cette forge.

Si vous êtes prof en France et que vous souhaitez utiliser la forge, rejoignez le [groupe Tchap de LaForgeÉdu](https://www.tchap.gouv.fr/#/room/!fnVhKrpqraWfsSirBK:agent.education.tchap.gouv.fr) pour plus d'explications !

1. [J'ai compris comment créer mon fichier, mais quelle est la syntaxe à respecter pour ChatMD ?](Syntaxe)

## Syntaxe
- syntaxe
- règles
- comment

La syntaxe pour écrire un chatbot avec chatMD est la suivante, mais c'est peut-être plus simple de [voir des exemples](#Exemples) ou bien de [récupérer un modèle](https://codimd.apps.education.fr/mBGbHStJSVOSrlGfGb981A?both).

\`\`\`
​# Titre du chatbot
​Message initial
​1​. [Premier choix](Réponse 1)
2​. [Deuxième choix](Réponse 2)
​
​## Réponse 1
- déclencheur 1 (optionnel)
- déclencheur 2 (optionnel)
Contenu de la réponse
​1​. [Proposition 1](Titre Proposition 1)
2​. [Proposition 2](Titre Proposition 2)
\`\`\`

Dans le message initial et le contenu de chaque réponse, **on peut utiliser toute la syntaxe Markdown** : intégrer des images, des vidéos, des iframes, et même utiliser des balises HTML.

Les **titres de niveau 2** servent à identifier les réponses possibles du chatbot

### Deux manières pour déclencher une réponse

:::info Avec la souris, l'utilisateur clique sur une proposition
Pour créer des boutons qui déclenchent des réponses quand on clique dessus, il faut utiliser une liste ordonnée en Markdown, qui doit avoir la forme suivante : 
\` 1. [intitulé de l'option qui s'affiche pour l'utilisateur](titre de la réponse correspondante dans le fichier en Markdown)\`
:::

:::info Avec le clavier, l'utilisateur pose une question
Pour permettre au chatbot de renvoyer la réponse la plus adéquate, on indique sous le titre de la réponse des déclencheurs (mots clés ou expressions) qui vont renforcer le choix de cette réponse. On utilise une liste non ordonnée en Markdown.
:::

Il est préférable de combiner ces 2 options pour être sûr que l'utilisateur trouve les réponses à ses questions !

1. [J'ai compris la syntaxe de base, mais quelles sont les options de configuration plus avancées](Options de configuration)
2. [Si on utilise des déclencheurs, comment fonctionne le choix de la réponse la plus adéquate ?](explication choix réponse adéquate)

## explication choix réponse adéquate

Si on utilise des déclencheurs, ChatMD calcule la réponse la plus adéquate.

Ce n'est pas une simple recherche d'occurrences : le calcul intègre une décomposition en tokens et un calcul de distance lexicale.

La décomposition en tokens permet de retrouver des racines communes et la distance lexicale permet de trouver une réponse malgré des fautes d'orthographe.

## Options de configuration
- options
- configuration
- avancé
- personnalisation
- personnaliser

Plusieurs options de configuration sont disponibles !
La plupart des options reposent sur l'ajout de paramètres dans l'en-tête YAML du fichier Markdown.

Que voulez-vous faire ?

1. [Améliorer l'algorithme de choix d'une réponse](option : Améliorer l'algorithme)
2. [Personnaliser l'apparence du chatbot](option : Personnaliser l'apparence)
3. [Gérer des contenus particuliers <span>(admonitions, mathématiques, schémas, sons …)</span>](option : Gérer des contenus particuliers)
4. [Organiser mon fichier source](option : Organiser son fichier source)
5. [Utiliser ChatMD pour faire des quiz](option : Utiliser ChatMD pour faire des quiz)
6. [Introduire de l'aléatoire dans les réponses ou les propositions en fin de message](option : Introduire de l'aléatoire)
7. [Utiliser des variables dynamiques et du conditionnement en fonction de ces variables](option : Variables dynamiques)
8. [Connecter ChatMD à un LLM, faire du RAG](option : Connecter ChatMD à un LLM, faire du RAG)
9. [Qu'est-ce qu'un en-tête YAML ?](Explication en-tête yaml)

## Explication en-tête yaml

Un en-tête YAML est une section spéciale dans laquelle on déclare certaines variables, qu'un programme comme ChatMD peut ensuite utiliser.
Cet en-tête doit se trouver au tout début du fichier. Il faut commencer et terminer l'en-tête par trois tirets \`-​-​-\`.

Voici un exemple d'en-tête YAML :

\`\`\`
-​-​-
gestionGrosMots: true
-​-​-
\`\`\`

## option : Améliorer l'algorithme

Pour améliorer l'algorithme de choix d'une réponse, vous pouvez utiliser ces paramètres dans l'en-tête YAML : 

- si on ajoute \`rechercheContenu: true\`, alors l'algorithme ne se contente pas de comparer le message de l'utilisateur avec le titre de la réponse et les déclencheurs, mais il compare aussi ce message avec le contenu entier de la réponse. Attention, dans ce cas, le chatbot peut mettre un peu plus de temps à se charger.
- \`gestionGrosMots: true\` permet de détecter les gros mots et les insultes envoyés par l'utilisateur et de formuler une réponse adéquate si l'utilisateur en utilise.
- \`messageParDéfaut: ["message 1", "message 2", "message 3"]\` permet de modifier le message par défaut qui s'affiche aléatoirement quand le chatbot n'a pas trouvé de réponse pertinente.

1. [Qu'est-ce qu'un en-tête YAML ?](Explication en-tête yaml)
2. [Je veux voir les autres options de configurations](Options de configuration)

## option : Personnaliser l'apparence

Pour personnaliser l'apparence du chatbot, vous pouvez utiliser ces paramètres dans l'en-tête YAML :

- \`style: a{color:red}\` permet d'ajouter des styles CSS personnalisés.
- \`avatar: URL\` permet de changer l'avatar du chatbot (il faut mettre l'url de son image à la place de URL)
- \`favicon: URL\` permet de changer l'icône du chatbot dans les onglets (il faut mettre l'url de son image à la place de URL)
- \`footer: false\` permet de supprimer le pied de page
- \`footer: 'Mon footer'\` permet de customiser ce qui apparaît dans le pied de page
- \`theme: bubbles\` permet d'utiliser un thème CSS particulier (ici le thème "bubbles")
- \`typewriter: false\` désactive l'effet “machine à écrire”
- \`clavier: false\` désactive le champ d'entrée clavier si on souhaite simplement guider l'utilisateur avec les options proposées en fin de chaque réponse.

Si on veut activer ou désactiver le clavier pour certaines réponses, on met \`&#96@​KEYBOARD = true&#96\` ou \`&#96@​KEYBOARD = false&#96\` à l'intérieur de son code markdown pour les réponses en question..

Si on veut désactiver l'effet typewriter pour un passage seulement de son texte, on utilise la syntaxe suivante dans son code markdown : \`\\&#96texte sans effet typewriter\\&#96\`

1. [Qu'est-ce qu'un en-tête YAML ?](Explication en-tête yaml)
2. [Je veux voir les autres options de configurations](Options de configuration)

## option : Gérer des contenus particuliers

### Admonitions

Dans le contenu en Markdown, vous pouvez utiliser des admonitions, c'est-à-dire des encadrés pour mettre en valeur certains contenus. Il faut utiliser la syntaxe suivante : 
\`\`\`
:​:​:info
contenu
:​:​:
\`\`\`

Plusieurs types d'admonitions sont disponibles (voir cet [exemple](https://codimd.apps.education.fr/9U7L4wpOSmaRFl6aRK-J9Q?both) et le [chatbot correspondant](https://chatmd.forge.apps.education.fr/#https://codimd.apps.education.fr/9U7L4wpOSmaRFl6aRK-J9Q))

### iframes et audio

Vous pouvez aussi utiliser :
1. des iframes pour intégrer des contenus interactifs comme H5P. Attention, il vaut mieux que le contenu en iframe soit le dernier contenu de votre réponse, car sinon votre iframe risque de mettre du temps à s'afficher.
2. la directive \`!​Audio : URLduFichierAudio\` pour jouer automatiquement un son lors du déclenchement d'une réponse (voir cet [exemple](https://codimd.apps.education.fr/24OabQgvQ_yPd2WE3DrIEg?both) et le [chatbot correspondant](https://chatmd.forge.apps.education.fr/#https://codimd.apps.education.fr/24OabQgvQ_yPd2WE3DrIEg)).

### Latex

Pour utiliser le Latex pour les mathématiques, il faut ajouter \`maths: true\` dans le YAML. On peut alors écrire des formules mathématiques en Latex avec la syntaxe \`$Latex$\` (à l'intérieur d'un paragraphe) ou \`$$Latex$$\` (pour un paragraphe à part).
	
### Schémas & graphiques

Pour pouvoir générer des schémas et graphiques via le service Kroki, il faut ajouter \`addOns: kroki\` dans le YAML. Cela permet de générer des schémas avec la syntaxe de Tikz, GraphViz, Mermaid, PlantUML ou Excalidraw, et des graphiques avec Vega ou Vegalite (voir cet [exemple](https://codimd.apps.education.fr/dJpCzTg0SPyPmbj24SSKbg?both) et le [chatbot correspondant](https://chatmd.forge.apps.education.fr/#https://codimd.apps.education.fr/dJpCzTg0SPyPmbj24SSKbg)).

1. [Qu'est-ce qu'un en-tête YAML ?](Explication en-tête yaml)
2. [Je veux voir les autres options de configurations](Options de configuration)

## option : Organiser son fichier source

### Variables fixes

Si votre chatbot devient un peu long et complexe, vous pouvez définir des variables fixes dans le YAML.

\`\`\`
variables:
	maVariable1: "Ceci est ma variable 1"
	maVariable2: "Ceci est ma variable 2"
\`\`\`

Dans votre contenu en Markdown, vous pourrez alors utiliser vos variables ainsi : &#64;{maVariable1}

Les variables fixes qui ne commencent pas par \`_\` sont interprétées au moment du déclenchement de la réponse, ce qui permet d'intégrer de l'aléatoire, en séparant les contenus possibles par \`///\`.
Les variables fixes qui commencent par \`_\` sont interprétées au moment de la génération du chatbot, ce qui permet de créer des variables fixes qui intègrent des propositions en fin de message.

&rArr; Voir cet [exemple](https://codimd.apps.education.fr/WySjMI5iQKOtTSJ3XhCZBQ?both) et le [chatbot correspondant](https://chatmd.forge.apps.education.fr/#https://codimd.apps.education.fr/WySjMI5iQKOtTSJ3XhCZBQ)

### Source répartie entre plusieurs fichiers

Si votre chatbot est très long, vous pouvez répartir la source de votre fichier dans plusieurs fichiers. Pour cela, il faut dupliquer le projet sur la forge et utiliser la fonction “raccourci” afin d'indiquer comme source plusieurs fichiers.

### Structuration du document

Si vous souhaitez pouvoir structurer les propositions en fin de message avec des titres, il faut écrire les options avec le code HTML nécessaire directement et non pas avec la syntaxe Markdown (voir cet [exemple](https://codimd.apps.education.fr/NJs77ZWnQgalVyA6nfuDLQ?both) et le [chatbot correspondant](https://chatmd.forge.apps.education.fr/#https://codimd.apps.education.fr/NJs77ZWnQgalVyA6nfuDLQ)).

Vous pouvez aussi ajouter dans le contenu Markdown des liens vers d'autres réponses, sans générer de bouton en fin de message, avec la syntaxe suivante : \`[intitulé du lien]​(#titre de la réponse)\`

\`titresRéponses: ["### ", "#### "]\` dans le YAML permet de changer les identifiants possibles des réponses du chatbot si on veut pouvoir structurer autrement les réponses du chatbot dans son document

1. [Qu'est-ce qu'un en-tête YAML ?](Explication en-tête yaml)
2. [Je veux voir les autres options de configurations](Options de configuration)


## option : Utiliser ChatMD pour faire des quiz

Un chatbot sert souvent à répondre à des questions, mais on peut aussi utiliser ChatMD pour poser des questions !

Si on veut que l'utilisateur réponde avec le clavier, la directive \`!​Next: Titreréponse\`, dans le contenu du Markdown, va forcer la redirection vers une réponse particulière : le message de l'utilisateur sera alors comparé aux déclencheurs choisis pour cette réponse ou même au contenu entier de la réponse si on a ajouté \`rechercheContenu: true\` dans le YAML. Si le message correspond, alors la réponse de l'utilisateur est considérée comme juste (voir cet [exemple](https://codimd.apps.education.fr/sp8dwq5rQGq3pIj2DPBD0A?both) et le [chatbot correspondant](https://chatmd.forge.apps.education.fr/#https://codimd.apps.education.fr/sp8dwq5rQGq3pIj2DPBD0A)).

Si on veut que l'utilisateur réponde en cliquant sur des propositions, on peut utiliser la propriété \`obfuscate: true\` dans l'en-tête YAML pour cacher le titre des liens, afin d'éviter de donner un indice en survolant un lien (voir cet [exemple](https://codimd.apps.education.fr/hWgravuHTTmfRydTUfjgWQ?both) et le [chatbot correspondant](https://chatmd.forge.apps.education.fr/#https://codimd.apps.education.fr/hWgravuHTTmfRydTUfjgWQ)).

On peut aussi introduire de l'aléatoire dans le choix des propositions (voir ci-dessous).

1. [Qu'est-ce qu'un en-tête YAML ?](Explication en-tête yaml)
2. [Comment introduire de l'aléatoire ?](option : Introduire de l'aléatoire)
3. [Je veux voir les autres options de configurations](Options de configuration)


## option : Introduire de l'aléatoire
Dans le contenu du Markdown, on peut indiquer plusieurs versions d'une même réponse en les séparant avec le séparateur \`-​-​-\`. Le chatbot sélectionnera aléatoirement l'une de ces versions.

On peut également choisir d'afficher seulement les propositions en fin de message de manière aléatoire. Si on met \`1. [intitulé]​(lien)\` : la proposition reste à la place indiquée, alors que si on met \`1) [intitulé]​(lien)\` : la proposition est réordonnée de manière aléatoire.

Dans le contenu du Markdown, la directive : \`!​Select: x\` peut être ajoutée juste avant la liste des propositions en fin de message, afin de sélectionner aléatoirement x propositions parmi cette liste (voir cet [exemple](https://codimd.apps.education.fr/f6QP57QNT2S-crAjOwdahg?both) et le [chatbot correspondant](https://chatmd.forge.apps.education.fr/#https://codimd.apps.education.fr/f6QP57QNT2S-crAjOwdahg)).

Enfin, la directive \`!​SelectNext: titre question 1 / titre question 2 / titre question 3\` permet de renvoyer de manière aléatoire vers une question parmi un ensemble de questions qu'on a choisies (voir cet [exemple](https://codimd.apps.education.fr/Yvq5u2btTOmrTFCFoXGTwg?both) et le [chatbot correspondant](https://chatmd.forge.apps.education.fr/#https://codimd.apps.education.fr/Yvq5u2btTOmrTFCFoXGTwg)).

1. [Qu'est-ce qu'un en-tête YAML ?](Explication en-tête yaml)
2. [Je veux voir les autres options de configurations](Options de configuration)


## option : Variables dynamiques

Pour utiliser les variables dynamiques, il faut ajouter \`contenuDynamique: true\` dans le YAML.

On peut avoir des variables dynamiques définies selon le parcours de l'utilisateur, et conditionner du contenu en fonction de ces variables.

On définit une variable soit dans le contenu en Markdown de la réponse, soit dans un bouton de réponse en fin de message. On utilise la syntaxe suivante : \`@​mavariable = contenu de ma variable\` que l'on place soit dans un bloc code dans le contenu de sa réponse : \`&#96@​mavariable = contenu de ma variable&#96\`, soit directement dans l'intitulé du lien du bouton de réponse : \`1. [intitulé @​mavariable = contenu de ma variable](titre réponse)\`.

Pour le conditionnement, on commence un bloc code avec \`i​f\` puis l'ensemble des conditions (par exemple \`&#96i​f @​mavariable1 == valeur1 && @​mavariable == valeur2&#96\`), puis on met ensuite ce qui doit s'afficher si cette condition est vérifiée, et on termine par un bloc code :  \`&#96end​if&#96\`.

&rArr; Voir cet [exemple](https://codimd.apps.education.fr/1l7Md8q-SjG0yLGHfH4wbg?both) et le [chatbot correspondant](https://chatmd.forge.apps.education.fr/#https://codimd.apps.education.fr/1l7Md8q-SjG0yLGHfH4wbg)

On peut également récupérer des paramètres dans l'URL pour les utiliser ensuite. Chaque paramètre est récupéré dans une variable : \`@​GE​Tnomduparamètre\` que l'on peut utiliser comme les autres variables dynamiques.

On peut récupérer le contenu d'un message entré par un utilisateur pour l'assigner à une variable dynamique en utilisant la syntaxe : \`@​mavariable  = @​INPUT : Titre réponse\`. Le message de l'utilisateur sera assigné à la variable et l'utilisateur sera redirigé automatiquement vers la réponse dont on a indiqué le titre.

&rArr; Voir cet [exemple](https://codimd.apps.education.fr/_2I1TWwBT22IML7BsR7sWw?both) et le [chatbot correspondant](https://chatmd.forge.apps.education.fr/#https://codimd.apps.education.fr/_2I1TWwBT22IML7BsR7sWw)

On peut enfin utiliser des opérations élémentaires pour calculer la valeur d'une variable (afin de calculer un score par exemple). Par exemple, on pourrait écrire : \`@​mavariable  = c​alc(@​score+1)\` soit dans un bloc code, soit dans un bouton en fin de message. À la place de \`c​alc(@​score+1)\`, on peut mettre une expression plus complexes avec plusieurs variables dynamiques. Les opérations utilisées sont l'addition, la soustraction, la multiplication, la division, la concaténation (avec le même signe que pour l'addition).

&rArr; Voir cet [exemple](https://codimd.apps.education.fr/6ZFeM407RbyCPxpAxKU8ow) et le [chatbot correspondant](https://chatmd.forge.apps.education.fr/#https://codimd.apps.education.fr/6ZFeM407RbyCPxpAxKU8ow)

1. [Qu'est-ce qu'un en-tête YAML ?](Explication en-tête yaml)
2. [Je veux voir les autres options de configurations](Options de configuration)


## option : Connecter ChatMD à un LLM, faire du RAG

ChatMD peut se connecter à un LLM en ligne ou en local : on peut choisir le modèle que l'on souhaite et tout configurer (préprompt, nombre de tokens, etc.). Pour faire appel à ce LLM, on peut soit décider de toujours produire la réponse par le LLM, en prenant en compte les éléments prédéfinis, soit n'utiliser le LLM qu'à des moments bien précis, par exemple pour enrichir une réponse préprogrammée.

ChatMD permet également de faire du RAG de manière simplifiée : on peut indiquer des sources d'informations, qui seront utilisées par le LLM pour produire sa réponse.
Ce RAG ne repose pas sur une vectorisation préalable de l'information. On pourrait le faire, mais l'intérêt est ici de ne pas multiplier les appels à une API externe, afin d'avoir un usage plus sobre de l'IA.

Pour comprendre comment tout cela fonctionne, le mieux est de regarder ces deux exemples :
- [Utiliser ChatMD avec un LLM en local](https://codimd.apps.education.fr/unR-D6xRSMOnvySa5-kCdg?both)
- [Utiliser ChatMD avec un LLM en ligne](https://codimd.apps.education.fr/nVOl6sQKTfqq_OWAUmxcYg?both)

1. [Qu'est-ce qu'un en-tête YAML ?](Explication en-tête yaml)
2. [Je veux voir les autres options de configurations](Options de configuration)



## Exemples
- exemple
- donner un exemple
- concret
- concrètement
- modèle
- template

Voici un modèle que vous pouvez récupérer pour construire votre chatbot : [modèle à récupérer](https://codimd.apps.education.fr/mBGbHStJSVOSrlGfGb981A?both)

Voici quelques exemples de chatbot créés avec ChatMD : 

- [Méthode de la dissertation en philosophie](https://chatmd.forge.apps.education.fr/#https://eyssette.forge.apps.education.fr/chatbot/dissertation-philosophie.md)
- [Utilisation d'un microscope](https://chatmd.forge.apps.education.fr/#https://codimd.apps.education.fr/xGNHIJSeTVCk6FHas-_71g) : un chatbot créé à partir du travail de  Sylvain Tissier, Guillaume Berthelot et de Jérémy Navoizat [voir la source](https://codimd.apps.education.fr/xGNHIJSeTVCk6FHas-_71g?both)

N'hésitez pas à partager vos exemples de chatbot avec moi ! Vous pouvez me contacter sur [Mastodon](https://scholar.social/@eyssette).

## Comment intégrer mon chatbot sur un site ?
- widget
- dans son site
- dans mon site
- intégrer
- intégration
- sur mon site
- sur son site
- iframe

Vous pouvez intégrer chatMD dans votre site de deux manières : soit avec une balise iframe, soit en tant que widget.

### Iframe
Pour utiliser ChatMD avec une balise iframe, vous pouvez utiliser le code suivant (en modifiant le style CSS si nécessaire) :

\`\`\`html
<iframe src=https://chatmd.forge.apps.education.fr/#URLDEVOTRECHATBOT" style="border:0; width:100%; height:700px"></iframe>
\`\`\`

### Widget
Pour utiliser ChatMD en tant que widget, il faut avoir accès au HTML et insérer ce code (en bas de page dans l'élément \`body\`).

\`\`\`js
<script id="chatmdWidgetScript"
src="https://chatmd.forge.apps.education.fr/widget.min.js" 
data-chatbot="URL_SOURCE_CHATBOT"></script>
\`\`\`

Il faut bien sûr remplacer \`URL_SOURCE_CHATBOT\` par l'URL de la source de votre chatbot.

On peut customiser l'image du widget en ajoutant \`data-image="URL_IMAGE"\` comme paramètre.

## Merci
- merci
- remercier
- remercie
- félicitations
- félicit
- bravo
- super
- excellent
- génial
- wow
- chouette
- sympa
- cool

Merci ! Si vous aimez ce travail, vous aimerez peut-être aussi les autres outils ou sites que je propose sur [mon site perso](https://eyssette.forge.apps.education.fr).

`;

let defaultMessage = [
	"Désolé, je ne comprends pas votre question.",
	"Pardonnez-moi, mais je ne saisis pas votre demande.",
	"Excusez-moi, je ne parviens pas à comprendre ce que vous demandez.",
	"Je suis navré, mais je ne parviens pas à saisir votre question.",
	"Malheureusement, je ne suis pas en mesure de comprendre votre question.",
	"Je suis désolé, mais je ne saisis pas votre question.",
	"Pardonnez-moi, mais je ne saisis pas le sens de votre question.",
	"Je m'excuse, mais je ne parviens pas à saisir votre demande. Pouvez-vous reformuler votre question, s'il vous plaît ?",
	"Je ne suis pas sûr de comprendre ce que vous demandez. Pouvez-vous expliquer davantage ?",
	"Je ne peux pas répondre à votre question telle qu'elle est formulée. Pouvez-vous la poser différemment ?",
	"Votre question ne semble pas correspondre à mes capacités actuelles. Pourriez-vous la reformuler autrement ?",
	"Je n'ai malheureusement pas compris votre requête.",
	"Je suis désolé, je ne suis pas capable de répondre.",
	"Malheureusement, je ne peux pas répondre à votre question.",
	"Malheureusement je n'arrive pas à comprendre votre requête.",
	"Excusez-moi, je ne comprends pas votre requête.",
	"Excusez-moi, je n'arrive pas à répondre à votre question.",
	"Je ne parviens pas à répondre à votre requête. Veuillez m'excuser.",
];

const badWordsMessage = [
	"Même si je ne suis qu'un chatbot, merci de vous adresser à moi avec un langage approprié",
	"Je préférerais que nous restions courtois dans notre communication.",
	"Les insultes ne sont pas nécessaires. Comment puis-je vous aider autrement ?",
	"Essayons de garder une conversation respectueuse.",
	"Je préfère une conversation respectueuse et productive.",
	"Je vous encourage à reformuler votre question ou commentaire de manière respectueuse.",
	"Les mots offensants ne sont pas nécessaires ici. Comment puis-je vous aider de manière constructive ?",
	"Restons courtois dans nos échanges, s'il vous plaît.",
	"Injures et grossièretés ne mènent nulle part. Comment puis-je vous assister ?",
	"Je suis ouvert à la discussion, mais veuillez garder un langage respectueux.",
	"Essayons de communiquer de manière civilisée !",
];

// Raccourcis vers des chatbots particuliers
const shortcuts = [
	["dissertation-philo","https://raw.githubusercontent.com/eyssette/chatbot/main/dissertation-philosophie.md"],
	["multiple-urls",["https://codimd.apps.education.fr/t7yi1Ak7Q--r2r4oB-3Uhg/download","https://codimd.apps.education.fr/fqjqvdIkQvWD-PVGONrq2g/download"]]
];

const corsProxy = "https://corsproxy.io/?";


// Gestion des addOns
const allowedAddOns = {
	pako: { js: "externals/pako.min.js" },
	kroki: { js: "externals/kroki.js" },
	textFit: {js: "externals/textFit.min.js", css: "<style>.katex-display{max-width:80%} .katex-display .textFitted{white-space:nowrap}</style>"}
};

const addOnsDependencies = {
	kroki: ["pako"]
}

// Paramètres dans l'en-tête YAML
let yamlStyle = "";
let yamlUserInput = true;
let yamlSearchInContent = false;
let yamldetectBadWords = false;
let yamlMaths = false;
let yamlFooter = true;
let yamlTheme = "";
let yamlDynamicContent = false;
let yamlTypeWriter = true;
let yamlObfuscate = false;
let yamlUseAddOns;
let yamlData;

// Paramètres pour l'utilisation d'un LLM
let yamlUseLLMurl;
let yamlUseLLMapiKey = ''; // Attention à ne pas mettre votre apiKey en public !
let yamlUseLLMmodel;
let yamlUseLLMalways = false;

const defaultMaxTokens = 100;
const defaultSystemPrompt = "Tu es un assistant efficace qui réponds en français et pas dans une autre langue. Les phrases de réponse doivent être courtes et claires."
const defaultPostprompt = "\nN'oublie pas de répondre en français.";
let yamlUseLLMsystemPrompt = defaultSystemPrompt;
let yamlUseLLMmaxTokens = defaultMaxTokens;
let yamlUseLLMinformations = '';
let yamlUseLLMpreprompt = '';
let yamlUseLLMpostprompt = defaultPostprompt;


// Paramètres pour le RAG
const defaultRAGprompt = `
Voici ci-dessous le contexte à partir duquel tu dois partir pour construire ta réponse, tu dois sélectionner dans ce contexte l'information pertinente et ne pas parler du reste. Si l'information n'est pas dans le contexte, indique-le et essaie de répondre malgré tout.
CONTEXTE : `;
const defaultRAGpromptStrict = `
Voici ci-dessous le contexte à partir duquel tu dois construire ta réponse, tu dois sélectionner dans ce contexte l'information pertinente et ne pas parler du reste. Si la réponse à la question n'est pas dans le contexte, tu ne dois pas répondre et dire : je ne sais pas. 
CONTEXTE : `;
let yamlUseLLMragSeparator = '\n';
let yamlUseLLMmaxTopElements = 3;
let yamlUseLLMragPrompt = defaultRAGprompt;


