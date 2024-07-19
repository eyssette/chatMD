# ChatMD

ChatMD est un outil libre et gratuit qui permet de créer facilement un chatbot personnalisé à partir d'un simple fichier en Markdown.

1. Créez un fichier en Markdown accessible en ligne.
2. Respectez la syntaxe de ChatMD pour définir votre chatbot.
3. Votre chatbot est alors accessible à l'adresse suivante : [https://chatmd.forge.apps.education.fr/#URL](https://chatmd.forge.apps.education.fr/#URL) (Mettez l'url de votre fichier à la place de URL) !

On peut imaginer de nombreux usages :
- Tutoriel pour un outil informatique
- Guide méthodologique
- Soutien pour la révision d'un cours, quiz interactif,
- Discussion avec un personnage historique,
- Histoire dont vous êtes le héros …

La syntaxe de base est simple, mais ChatMD peut être configuré pour des usages plus complexes : personnalisation de l'interface, utilisation de variables, de choix aléatoires, intégration avec un LLM, possibilité de faire du RAG …

Pour plus d'explications, laissez-vous guider par le [chatbot initial](https://chatmd.forge.apps.education.fr/).

## Crédits

Chat MD est un outil libre et gratuit sous licence MIT. Les sources sont disponibles sur [la Forge des Communs Numériques Éducatifs](https://forge.apps.education.fr/chatMD/chatMD.forge.apps.education.fr).

ChatMD n'aurait pas pu exister sans le soutien institutionnel de la DRANE Lyon et de la DNE, dans le cadre de leur politique de développement des communs numériques et du libre.

Merci également à Perrine Douhéret, Laetitia Allegrini, Romain Estampes, Charlie Rollo, Mélanie Fenaert pour leurs suggestions d'amélioration de l'outil, et merci à toutes les personnes qui ont pu tester ChatMD et me faire des retours !

ChatMD est un logiciel libre qui repose également sur d'autres logiciels libres :
- [js-yaml](https://github.com/nodeca/js-yaml) pour la gestion des en-têtes yaml
- [typed.js](https://github.com/mattboldt/typed.js) pour l'effet "machine à écrire"
- [showdown](https://github.com/showdownjs/showdown) pour la conversion du markdown en html
- [leo-profanity](https://github.com/jojoee/leo-profanity) et [french-badwords-list](https://github.com/darwiin/french-badwords-list/) pour la gestion des gros mots
- [katex](https://katex.org/) pour la gestion des mathématiques en Latex
- [textFit](https://github.com/STRML/textFit) pour la gestion du redimensionnement automatique (ici : des formules mathématiques en Latex).

Si vous aimez ce travail, vous aimerez peut-être aussi les autres outils ou sites que je propose sur [mon site perso](https://eyssette.forge.apps.education.fr).