# Hello !

En suivant ce tutoriel pour découvrir le développement web, tu vas construire une version en réseau du célèbre TIC-TAC-TOE.

Le but n'est pas d'aller le plus vite possible et de distraire les collègues avec ce super jeu que tu auras développer (même si c'est super tentant), mais plutôt de comprendre les principes de la création d'applications web.

Ce qui est cool c'est qu'on va stocker tout ça sur un espace que l'on va te créer sur Github, une plateforme en ligne où les développeurs stockent leur sources privées et publiques. L'avantage c'est que c'est accessible de partout, il faut juste penser à envoyer ton boulot dessus régulièrement à l'aide de [git](https://fr.wikipedia.org/wiki/Git) (un logiciel de gestion de versions déjà installé sur ton PC).

## Création de ton espace Github

J'pense que tu peux te débrouiller pour cette étape ;)

## TODO Récupération d'un projet existant

Ton espace est prêt à être utilisé, on va commencer par y pousser les premières sources.

## Architecture du projet

Un point essentiel dans notre métier: la capacité à structurer son code. Tu t'en doutes un peu, si on commencer à écrire 100 000 lignes de code dans un seul fichier, ça va être compliqué pour s'y retrouver aussi bien pour nous que pour les autres.

Y'a énormément de façon de faire. Mais de manière générale, on va chercher à isoler les responsabilités: les fichiers qui gèrent le serveur dans un dossier `server`, ceux qui gèrent la partie visible par le client dans un dossier `client`... C'est ce que tu devrais retrouver dans le projet que tu viens de récupérer.

Si on regarde la partie client, tu y retrouveras plusieurs choses: 

- les fichiers `index` qui sont en général les points d'entrées de ton application
- les fichiers de définition des métadonnées et de gestions des dépendances: `package*.json`
- dans notre cas un dossier `components` qui va gérer les composants, c'est à dire les briques de notre application (le composant bouton, le composant case, le composant plateau...)
- et un dossier `containers` qui va être une sorte d'assemblage de ses composants, représentant souvent une page (la page home, la page de jeu...)

Une logique architecturale qui peut s'appliquer également à la partie `server`, avec certaines adaptations. Dans notre cas, cette partie server sera assez simple et comprendra un fichier `index`, et quelques fichiers utilitaires ;)

*Je te laisse apprivoiser l'ensemble de ces fichiers, les ouvrir, peut-être faire quelques recherches sur internet pour en savoir plus et me soliciter si besoin pour comprendre un peu ce qu'ils représentent. Après ça, [on passe à la suite avec l'installation du projet](./INSTALL.md).*
