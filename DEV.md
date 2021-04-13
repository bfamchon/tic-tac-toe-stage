# DÉVELOPPEMENT

## Introduction

Nous allons travailler sur le `container` de la page d'accueil (`Home`), elle va en quelques sortes contenir la logique et l'affichage des choix proposés à l'utilisateur en fonction de l'état du jeu.

Dans son état initial, 2 choix lui seront proposés: créer une nouvelle partie et rejoindre une partie existante.

Concentrons nous sur cet étape et observons le container `Home` qui représente pour le moment un composant dans sa forme la plus simple :

```javascript
import React from 'react';

const Home = () => {
    return (
        <div>hello world i'm the home page</div>
    )
}

export default Home;
```

La première ligne commençant par `import` signifie que l'on souhaite importer une dépendance dans ce composant: ici, `React`.

Ensuite, nous déclarons un élément `Home` et lui donnons comme valeur une fonction `const Home = () => {}`, cette notation s'appelle une "fonction fléchée" en Javascript.

Cette fonction fléchée, retourne un noeud HTML `<div>hello world i'm the home page</div>`, quelque chose qui doit te parler un petit peu ici. ;)

Et pour terminer, on exporte cet élément `export default Home` afin de l'utiliser à d'autres endroits de notre application (nous on l'utilisera dans `Game`, si tu y jettes un oeil).

Voici ce que l'on appelle un composant React, dans sa forme la plus simple.

## On regarde ce que ça donne

Dans le fichier `package.json`, tu trouveras différents `scripts` qui sont généralement similaires sur un grand nombre d'application, nous on a besoin que du `start` pour lancer notre projet.

Alors allons-y ! Dans le dossier client, à l'image de la commande `npm install`, tu vas pouvoir lancer la commande `npm run start`... L'application devrait être disponnible à l'adresse `localhost:3000` sur ton navigateur, et tu y verras la phrase `hello world i'm the home page`, ça te rappelle quelque chose ? Tu peux essayer de changer la phrase pour te rendre compte que les changements sont visibles sur l'application ;)

## Place à l'action !

On retourne maintenant dans `Home` pour y ajouter un peu plus de contenu.

On va commencer par ajouter ce que l'on appelle un "state" à notre composant `Home`. Le state va venir définir l'état de notre composant.

```javascript
const Home = () => {
    const [step, setStep] = React.useState(1); // Étape du jeu
    const [name, setName] = React.useState(''); // Nom du joueur
    const [newGame, setNewGame] = React.useState(null); // Est-ce qu'on lance un nouveau jeu ?
    const [room, setRoom] = React.useState(''); // La salle de jeu
    const [loading, setLoading] = React.useState(false); // Est-ce que mon jeu est entrain de charger qqch ?
    const [serverConfirmed, setServerConfirmed] = React.useState(false); // Est-ce que le serveur a confirmé notre participation ?
    const [error, setError] = React.useState(false); // Est-ce qu'il y a eu une erreur ?
    const [errorMessage, setErrorMessage] = React.useState(''); // Le message d'erreur
    return ...
}
```

Pour comprendre l'utilisation de `useState()`, voici la documentation officielle de React qui explique avec quelques cas d'usage: https://fr.reactjs.org/docs/hooks-state.html

Nous allons ensuite gérer un affichage conditionnel selon l'état du state que l'on a défini.

```javascript
...
import { Redirect } from 'react-router-dom' // On importe une nouvelle dépendance dans notre composant

const Home = () => {
    ...
    const getHomeByGameState = () => {
        if (serverConfirmed) { // Si le serveur à confirmé notre participation (nous allons gérer ce cas plus tard)
            return (// alors on est redirigé dans une partie
                <Redirect to={`/game?room=${room}&name=${name}`} />
            )
        } else { // Si ce n'est pas le cas
            switch (step) {
                case (1): // Et que l'on se trouve dans l'état de jeu initial (1)
                    return ( // On affiche les éléments de l'état initial du jeu (nouvelle partie ou rejoindre)
                        <InitialGameState onChoice={() => {}} />
                    );
                default: // Le cas par défaut est de ne rien retourner.
                    return null
            }
        }
    };
    
    return getHomeByGameState(); // On appelle la fonction déclarée plus haut qui va nous retourner des éléments à afficher...
}
```

À ce stade, tu devrais avoir une erreur dans ton navigateur t'indiquant que InitialGameState n'existe pas... C'est normal ! On a pas encore créé ni importé ce composant, et notre fonction `getHomeByGameState()` nous renvoie dans ce cas. 

Dans le dossier `components`, nous allons donc créer le fichier `InitialGameState.js` et à l'intérieur, le composant du même nom, à l'image de `Home` dans l'introduction.

N'oublions pas de l'importer pour qu'il soit utilisable dans `Home` : `import InitialGameState from '../components/InitialGameState';` ! ;)

*Tu devrais retrouver l'application dans son état de départ...*

On va maintenant compléter ce composant !

```javascript
import React from 'react';
import ChoiceButton from './ChoiceButton' // Un nouveau composant à créer plus tard !

const InitialGameState = ({onChoice}) => { // On voit ici un passage de propriétés à notre composant, si tu regardes bien dans Home, on a écrit onChoice={() => {}} (une fonction fléchée vide)... Et on retrouve ce onChoice ici !
    return (
        <>
        <div className='choice-container'>
            <ChoiceButton onClick={() => onChoice('new')} type='primary' label='Start New Game'/> 
            <ChoiceButton onClick={() => onChoice('join')} type='secondary' label='Join A Game'/> 
        </div>
        </>
    );
}

export default InitialGameState;
```

Tu remarques ici que l'on utilise le composant `ChoiceButton` et qu'on lui passe des propriétés (onClick, type, label)... C'est un moyen de passer des informations entre les composants, comme on l'a fait pour `InitialGameState` avec le `onChoice` !

Créons maintenant le composant `ChoiceButton`:

```javascript
import React from 'react';

const ChoiceButton = ({type, label, onClick}) => { // encore un passage de propriétés ;)
    return (
        <button className={`btn btn-${type}`} onClick={onClick}>{label}</button>
    );
}

export default ChoiceButton;
```

*Tu devrais avoir deux magnifiques boutons, amuse toi à changer leur libelé et observer les changements...*

## Gestion des formulaires

Si tu te souviens bien, on avait déclarée une fonction fléchée vide pour la propriété `onChoice`... Ce qui veut dire que si tu cliques sur les boutons, y'a pas grand chose qui va se passer ! Changeons tout ça et retournons dans le composant `Home`.

Pour une première étape, essaies de remplacer notre utilisation de `<InitialGameState onChoice={() => {}} />` par `<InitialGameState onChoice={() => console.log('clicked !')} />`...Et dans le navigateur, ouvre ta console de développement... Tu devrais y voir afficher des choses en clickant sur le bouton ;)

Créons maintenant une fonction qui va faire avancer l'état du jeu. Juste au dessus de la fonction `getHomeByGameState`, ajoutes les fonctions suivantes:

```javascript
    const stepBack = () => { // avancer l'état du jeu
        setStep(step - 1);
    }

    const stepForward = () => { // reculer l'état du jeu
        setStep(step + 1);
    }

    const onInitialGameStateButtonClicked = (choice) => {
        const gameChoice = choice === 'new' ? true : false; // cette notation s'appelle une ternaire et correspond à un IF/ELSE, écrit différemment
        setNewGame(gameChoice); // Est-ce que l'on veut lancer une nouvelle partie ou la rejoindre ?
        stepForward(); // On avance notre étape du jeu !
    };
```

Et à la place du `<InitialGameState onChoice={() => console.log('clicked !')} />`, nous allons plutôt utiliser la fonction que nous venons de créer: `<InitialGameState onChoice={onInitialGameStateButtonClicked} />`

En cliquant sur le bouton pour lancer une nouvelle partie, tu devrais maintenant avoir une page vide... C'est tout à fait normal ! Notre step vaut maintenant `2`, et le cas n'est pas géré dans le `switch`, nous tombons donc dans le cas par défaut qui n'affiche rien...

Changeons ça et gérons le cas où notre `step` vaut `2`. Essaie de placer ce bout de code à l'endroit qui te semble le plus approprié... Un indice, regarde du côté du switch. ;) 

```javascript
...
case(2):
    return (
        <>
            <Loading loading={loading}/>
            <Error display={error} message={errorMessage}/>
            <InputForm 
                stepBack={stepBack} 
                onSubmit={() => {}} // fonction fléchée vide pour le moment...
                onTyping={() => {}} // fonction fléchée vide pour le moment...
                newGame={newGame}
                name = {name}
                room = {room}/> 
        </>
    );
...
```

Bien entendu, tu auras une nouvelle erreur qui t'indiquera que les composants `Loading`, `Error` et `InputForm` n'existe pas... Créons les !

Et voici pour `Loading.js`: 
```javascript
import React from 'react';

const Loading = ({loading}) => {
    return (
        <div className="loader" style={{display:loading?'flex':'none'}}>
            <i className="fa fa-spinner fa-pulse fa-4x fa-fw"></i>
            <span style={{userSelect: 'none'}}>Loading...</span>
        </div>
    );
}

export default Loading;
```

Pour `Error.js`:

```javascript
import React from 'react';

const Error = ({display, message}) => {
    return (
        <div className="error" style={{opacity:display?'100%':'0'}}>
            <h1 className="error-message">
                {message}
            </h1>
        </div>
    );
}



export default Error;
```

Et pour `InputForm.js`:
```javascript
import React from 'react';
import ChoiceButton from './ChoiceButton' // Un composant que l'on a déjà créé !

const InputForm = ({stepBack, onSubmit, onTyping, newGame, name, room}) => {
    if (newGame){
        return (
            <div className="input-container">
                <input 
                name='name'
                placeholder='Your Name...'
                onChange = {onTyping}
                value = {name}
                />
                <div className='nav-container'>
                    <ChoiceButton type='nav-back' onClick={stepBack} label='Back'/>
                    <ChoiceButton type='nav-forward' onClick={onSubmit} label="Let's Go"/>
                </div>
            </div>
        );
    } else {
        return (
            <div className="input-container">
                <input 
                name='name'
                placeholder='Your Name...'
                onChange = {onTyping}
                value = {name}
                />
                <input 
                name='room'
                placeholder='Room ID...'
                onChange = {onTyping}
                value = {room}
                />
                <div className='nav-container'>
                    <ChoiceButton type='nav-back' onClick={stepBack} label='Back'/>
                    <ChoiceButton type='nav-forward' onClick={onSubmit} label="Let's Go"/>
                    
                </div>
            </div>
        );
    }
    
}

export default InputForm;
```

Et bien sûr, à l'image de ce qu'on a du faire dans `Home` pour `InitialGameState`, il faut importer ces 3 nouveaux composants... En te basant sur le modèle de `InitialGameState`, tu devrais pouvoir trouver comment faire. ;)

*À ce stade, tu devrais pouvoir clicker sur le bouton pour une nouvelle partie et celui pour rejoindre une partie, puis sur le bouton Back ! Prends le temps de bien comprendre ce qu'il se passe dans ces composants et identifier dans quel cas on se trouve en fonction du bouton sur lequel on clique.*

Si tu te souviens bien, pour gérer le cas où notre `step` valait `2`, nous avions écrit:

```javascript
<InputForm 
    stepBack={stepBack} 
    onSubmit={() => {}} // fonction fléchée vide pour le moment...
    onTyping={() => {}} // fonction fléchée vide pour le moment...
    newGame={newGame}
    name = {name}
    room = {room}/> 
```

Et donc déclaré deux fonctions fléchées vides pour `onSubmit` et `onTyping`... Raison pour laquelle il ne se passe pas grand chose quand tu cliques sur `Let's go !` ou que tu essaies d'écrire ton nom ou celui de la Room dans le formulaire.

Je te laisse changer ça, comme tout à l'heure, pour afficher un message en console (`console.log('ton message !')`) avant de passer à la suite.

Créons maintenant la fonction suivante juste au dessus de la fonction `getHomeByGameState`: 

```javascript 
...

const onUserWritingSomething = (event) => { // cette fonction prend en paramètre un événement
    const target = event.target.name; // On récupère l'émetteur de l'event
    const value = event.target.value; // Et la valeur associée
    if (target === 'name') { // Si l'émetteur a pour nom 'name'
        setName(value); // Alors on change le nom dans le state...
    } else if (target === 'room') { // Si l'émetteur a pour nom 'room'
        setRoom(value); // Alors on change la room dans le state...
    }
}

...
```

Puis d'utiliser cette fonction à la place de la fonction fléchée vide `onTyping`:

```javascript
    <Loading loading={loading} />
    <Error display={error} message={errorMessage} />
    <InputForm
        stepBack={stepBack}
        onSubmit={() =>{}}
        onTyping={onUserWritingSomething} // Nous avons changé la fonction utilisée !
        newGame={newGame}
        name={name}
        room={room} />
```

Ce qu'il est important à comprendre ici, et peut-être que tu l'as observé dans ton apprentissage du javascript, c'est que quand on intéragit avec un bouton, un input, une checkbox... Un événement est lancé.

En observant notre composant `InputForm`, tu as sûrement remarqué que nous avions utilisé `onChange={onTyping}`...Nous avons fait en sorte d'associer l'événement `onChange` à la fonction `onTyping`. Ce qui signifie que lors d'un changement sur un input, la fonction `onTyping` sera appelée, un événement sera lancée avec les paramètres de l'input: son `name` et sa `value` par exemple (voir ci-dessous).

```javascript
<input 
    name='name'
    placeholder='Your Name...'
    onChange = {onTyping}
    value = {name}
/>
```

Occupons nous du `onSubmit` maintenant ! Toujours au dessus de `getHomeByGameState`, nous allons créer trois nouvelles fonctions: 

```javascript

    const isMyFormValid = () => {
        if (newGame) { // Si on est dans le cas d'une nouvelle partie, le nom doit être différent de la chaîne de caractères vide: ''
            return name !== '';
        } else { // Si on est dans le cas où l'on veut rejoindre une partie, le nom et la room doivent être différents de la chaîne de caractères vide: ''
            return name !== '' && room !== '';
        }
    }

    const displayError = (message) => {
        setError(true); // On change notre state pour indiquer qu'une erreur est présente...
        setErrorMessage(message); // Et on indique également le message d'erreur
        setLoading(false); // L'application ne charge plus
        setTimeout(() => {
            setError(false);
            setErrorMessage('');
        }, 3000)
    }

    const onUserSubmitHisForm = () => {
        setLoading(true); // On passe l'application dans un état Loading
        if (isMyFormValid()) { // est-ce que mon formulaire est valide ?
            if (newGame) { // Si on demandait à faire une nouvelle partie
                // TODO Appeler le serveur et lui demander de créer une partie !
                console.log('Je demande à appeler le serveur pour créer une nouvelle partie !')
            } else {
                // TODO Appeler le serveur et lui demander de rejoindre une partie !
                console.log('Je demande à appeler le serveur pour rejoindre une nouvelle partie !')
            }
        } else { // Oops... Le formulaire n'est pas valide !
            displayError(newGame ? 'Please fill out your name' : 'Please fill out your name and room id') // On demande à afficher un message d'erreur.
        }
    }
```

Ici, nous avons utilisé un setTimeout:

```javascript
setTimeout(() => {...}, 3000)
```

À ton avis, qu'est ce que ça fait ? Je te laisse manipuler l'application que tu viens de créer pour t'en rendre compte !

...

...

Tu as compris ? Un message d'erreur temporaire apparait à l'écran quand les champs sont mal renseignés ! 

`setTimeout` va en fait éxecuter la fonction fléchée au bout d'un temps que tu lui donnes en milisecondes: `3000` soit 3sec dans notre cas... Amuse toi à changer ça pour t'en rendre compte. ;)

*À ce stade, tu devrais pouvoir utiliser l'application en cliquant sur tous les boutons, en remplissant les formulaires et en ayant des erreurs si quelque chose est mal rempli...*

*Refais bien le cheminement des fonctions pour comprendre ce que l'on a réalisé dans cette première étape. L'idée n'est pas d'aller le plus vite possible mais bien de comprendre ce qu'il se passe.*

Comme tu as pu le constater, nous avons utiliser des `console.log()` temporaires pour indiquer qu'à certains endroits, nous allons contacter le serveur afin de lui demander de créer une nouvelle partie ou de la rejoindre. *[Ce sera le but de la prochaine étape](./SERVER.md).*