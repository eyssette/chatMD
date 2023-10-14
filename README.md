# ChatMD

ChatMD est un chatbot, que vous pouvez configurer par vous-même en Markdown :

- Créez un fichier en [markdown]((https://www.markdowntutorial.com/fr/)) et mettez-le en ligne : sur [CodiMD](https://codimd.apps.education.fr/), ou sur une [forge](https://forge.aeif.fr/)
- Respectez la syntaxe de ChatMD pour définir votre chatbot
 
Votre chatbot est alors prêt et visible à l'adresse suivante : [https://eyssette.github.io/chatMD/#URL](https://eyssette.github.io/chatMD/#URL) (Mettez l'url de votre fichier à la place de URL)


## Syntaxe

La syntaxe pour écrire un chatbot avec chatMD est la suivante :

- On définit le titre du chatbot dans un titre de niveau 1
- Le message initial est à mettre dans un bloc de citation après le titre du chatbot
- Les titres de niveau 2 servent à identifier les réponses possibles du chatbot
- Sous chaque titre de niveau 2 : 
	- On indique avec une liste non ordonnée les mots clés ou expressions qui vont déclencher la réponse. On peut éventuellement s'en passer si on guide l'utilisateur avec un choix d'options (voir ci-dessous).
	- On écrit une réponse en Markdown.
	- [Optionnel] On indique avec une liste ordonnée les options possibles. Chaque élément de la liste doit être un lien en Mardown de la forme suivante : \`[intitulé de l'option](identifiant de l'option, qui doit correspondre à l'un des titres de niveau 2)\`.

## Exemple

Voici un exemple de chatbot qui a été créé avec ChatMD à partir du travail de Guillaume Berthelot et de Jérémy Navoizat : 

- [Utilisation d'un microscope](https://eyssette.github.io/chatMD/#https://codimd.apps.education.fr/xGNHIJSeTVCk6FHas-_71g/download).

Vous pouvez aussi [voir la source](https://codimd.apps.education.fr/xGNHIJSeTVCk6FHas-_71g?both) pour mieux comprendre