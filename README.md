# ChatMD

ChatMD est un chatbot, que vous pouvez configurer par vous-même en Markdown :

- Créez un fichier en [markdown]((https://www.markdowntutorial.com/fr/)) et mettez-le en ligne : sur [CodiMD](https://codimd.apps.education.fr/), ou sur une [forge](https://forge.aeif.fr/)
- Respectez la syntaxe de ChatMD pour définir votre chatbot
 
Votre chatbot est alors prêt et visible à l'adresse suivante : [https://eyssette.forge.aeif.fr/chatMD/#URL](https://eyssette.forge.aeif.fr/chatMD/#URL) (Mettez l'url de votre fichier à la place de URL)


## Exemples

Voici un modèle que vous pouvez récupérer pour construire votre chatbot : [modèle à récupérer](https://codimd.apps.education.fr/mBGbHStJSVOSrlGfGb981A?both)

Voici quelques exemple de chatbot créés avec ChatMD :

- [Méthode de la dissertation en philosophie](https://eyssette.forge.aeif.fr/chatMD/#https://eyssette.forge.aeif.fr/chatbot/dissertation-philosophie.md)
- [Utilisation d'un microscope](https://eyssette.forge.aeif.fr/chatMD/#https://codimd.apps.education.fr/xGNHIJSeTVCk6FHas-_71g) : un chatbot créé à partir du travail de Sylvain Tissier, Guillaume Berthelot et de Jérémy Navoizat ([voir la source](https://codimd.apps.education.fr/xGNHIJSeTVCk6FHas-_71g))


## Syntaxe

La syntaxe pour écrire un chatbot avec chatMD est la suivante :

- On définit le titre du chatbot dans un titre de niveau 1
- Le message initial est à mettre dans un bloc de citation après le titre du chatbot
- Les titres de niveau 2 servent à identifier les réponses possibles du chatbot
- Sous chaque titre de niveau 2 : 
	- On indique avec une liste non ordonnée les mots clés ou expressions qui vont déclencher la réponse. On peut éventuellement s'en passer si on guide l'utilisateur avec un choix d'options (voir ci-dessous).
	- On écrit une réponse en Markdown.
	- [Optionnel] On indique avec une liste ordonnée les options possibles. Chaque élément de la liste doit être un lien en Mardown de la forme suivante : \`[intitulé de l'option](identifiant de l'option, qui doit correspondre à l'un des titres de niveau 2)\`.

## Options de configuration plus avancées

On peut ajouter un en-tête yaml à son fichier Markdown.  
Par exemple :

```yaml
clavier: false
rechercheContenu: true
gestionsGrosMots: true
style: a{color:red}
maths: true
titresRéponses: ["### ", "#### "]
footer: false
theme: bubbles
```

- `clavier: false` désactive le champ d'entrée clavier si on souhaite simplement guider l'utilisateur avec les options proposées en fin de chaque réponse.
- `rechercheContenu: true` permet d'ajouter une recherche de comparaison de l'entrée de l'utilisateur avec le contenu de chaque réponse
- `gestionGrosMots: true` permet de détecter les gros mots envoyés par l'utilisateur et de formuler une réponse adéquate si l'utilisateur en utilise
- `style: a{color:red}` permet d'ajouter des styles CSS personnalisés.
- `maths: true` permet d'écrire des formules mathématiques en Latex avec la syntaxe `$Latex$` ou `$$Latex$$`
- `avatar: URL` permet de changer l'avatar du chatbot (il faut mettre l'url de son image à la place de URL)
- `footer: false` permet de supprimer le footer
- `theme: bubbles` permet d'utiliser un thème CSS particulier (ici le thème "bubbles")

Le chatbot peut aussi sélectionner de manière aléatoire plusieurs versions d'une même réponse si on sépare ces différentes versions avec le séparateur `---`

D'autres options plus avancées dans l'en-tête yaml :
- `messageParDéfaut: ["message 1", "message 2", "message 3"]` permet de modifier le message par défaut qui s'affiche aléatoirement quand le chatbot n'a pas trouvé de réponse pertinente 
- `titresRéponses: ["### ", "#### "]` permet de changer les identifiants possibles des réponses du chatbot si on veut pouvoir structurer les réponses du chatbot dans son document
- On peut aussi définir des variables que l'on peut utiliser dans son chatbot ainsi : @{maVariable1}
```
variables:
	maVariable1: "Ceci est ma variable 1"
	maVariable2: "Ceci est ma variable 2"
```

## À quoi ça sert ?

On peut imaginer plusieurs usages de chatMD :
- Tutoriel pour un outil informatique
- Histoire dont vous êtes le héros
- Guide méthodologique
- Soutien pour la révision d'un cours
- Discussion avec un personnage historique …

On peut faire travailler des élèves ensemble sur un CodiMD, ou bien travailler collaborativement entre collègues, en tant que prof ou dans le cadre d'une formation.

Si vous avez trouvé des idées intéressantes, n'hésitez pas à les partager avec moi. Vous pouvez me contacter sur [Mastodon](https://scholar.social/@eyssette).

## Crédits

Chat MD est un outil libre et gratuit sous licence MIT.

Il utilise d'autres logiciels libres :
- [js-yaml](https://github.com/nodeca/js-yaml) pour la gestion des en-têtes yaml
- [typed.js](https://github.com/mattboldt/typed.js) pour l'effet "machine à écrire"
- [showdown](https://github.com/showdownjs/showdown) pour la conversion du markdown en html
- [leo-profanity](https://github.com/jojoee/leo-profanity) et [french-badwords-list](https://github.com/darwiin/french-badwords-list/) pour la gestion des gros mots
- [katex](https://katex.org/) pour la gestion des mathématiques en Latex

Merci à Perrine Douhéret pour ses suggestions d'amélioration de l'outil !