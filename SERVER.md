# Premiers contacts avec le serveur

## Introduction

Pour que plusieurs joueurs puissent jouer dans la même partie, nous allons introduire un serveur dans notre application. Il sera là pour gérer les joueurs, les parties, les déplacements...

Et pour celà, nous allons utiliser une librairie bien connue des développeurs Javascript, surtout quand on veut toucher au temps réel:  [socket.io](https://socket.io/).

On a l'habitude des communications clients vers serveur, pour récupérer des informations en base de données par exemple, mais comment faire de la communication serveur vers client ?

Socket.io répond à cette problématique en proposant un système de communication par événements bi-directionnel et en temps réel.

Allons-y et commençons par créer un fichier `index.js` dans le dossier `server`, ce sera donc le point d'entrée de notre serveur.

```javascript
//utilities functions and classes
const cors = require('cors');
//set up express server
const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const PORT = process.env.PORT || 4000;

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: '*',
    }
});

io.on('connection', socket => {
    //On the client submit event (on start page) to create a new room
    socket.on('newGame', () => {
        console.log('newGame event received !');
        return;
    })

    //On the client submit event (on start page) to join a room
    socket.on('joining', ({ room }) => {
        console.log('joining event received !');
        return;
    })

    socket.on('newRoomJoin', ({ room, name }) => {
        console.log('newRoomJoin event received !');
        return;
    })

    //Listener event for each move and emit different events depending on the state of the game
    socket.on('move', ({ room, piece, index }) => {
        console.log('move event received !');
        return;
    })

    //Listener event for a new game
    socket.on('playAgainRequest', (room) => {
        console.log('playAgainRequest event received !');
        return;
    })

    //On disconnect event
    socket.on('disconnecting', () => {
        console.log('disconnecting event received !');
        return;
    })
})


server.listen(PORT, () => console.log(`Listening on port ${PORT}`))
```

La première partie ci-dessous concerne la mise en place de notre serveur, on va configurer un serveur HTTP et lui associer la librairie socket.io.

```javascript
//utilities functions and classes
const cors = require('cors');
//set up express server
const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const PORT = process.env.PORT || 4000;

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: '*',
    }
});

...
```

La seconde partie concerne la gestion des différents événements (connection, newGame, joining...). Pour le moment, nous allons afficher seulement un log dans la console du terminal (comme nous sommes côté serveur) ;)

## Retournons du côté des clients pour instaurer la communication avec le serveur

Nous allons créer, au même niveau que le fichier `Game.js`, un fichier nommé `socket.js` qui va être en charge de gérer la connexion websocket de notre application.

Nous allons ajouter la dépendance à socket.io-client, qui va nous permettre de communiquer avec ce que l'on vient de réaliser côté serveur... Ainsi que deux fonctions fléchées, responsable d'initialiser la connexion et de déconnecter le socket.

```javascript
import socketIOClient from 'socket.io-client'
const ENDPOINT = 'ws://localhost:4000';

let socket = null;

export const initializeSocketConection = () => {
    return getSocket();
}
export const getSocket = () => {
    if (socket) {
        return socket;
    }
    socket = socketIOClient(ENDPOINT);
    return socket;
}s
export const disconnectSocket = () => {
    socket.disconnect();
}
```

Et nous allons ensuite faire en sorte que la communication websocket soit instaurée quand notre composant `Home` est affiché à l'écran de l'utilisateur.

Pour ce faire, nous allons utiliser un nouvel outils mis à disposition par React: `useEffect` à disposer juste avant la fonction `getHomeByGameState`.

```javascript
    React.useEffect(() => {
        const socket = initializeSocketConection(); // Initier la connexion avec le serveur
        socket.on('newGameCreated', (room) => {
            // On a reçu un événement newGameCreated avec une room dans les paramètres
            setRoom(room); // Et on lui ajoute la room reçue
            setServerConfirmed(true); // on change le state de notre composant Home
        })
        socket.on('joinConfirmed', () => {
            // On a reçu un événement joinConfirmed
            setServerConfirmed(true); 
        })
        socket.on('errorMessage', (message) => displayError(message));
        return () => {socket = null}; // Cette ligne signifie que si notre composant vient à disparaitre (un rafraîchissement de page par exemple)
    }, []);
```

*À ce stade, tu devrais voir un log dans le terminal indiquant qu'un event `disconnecting` a été reçu quand tu rafraichis la page...*

Si tu te souviens bien, nous avions ajouter des `console.log` aux endroits où nous souhaitions appeler le serveur.

On commence par ajouter deux nouvelles fonctions utilitaires dans le fichier `socket.js`

```javascript
...
export const emitNewGameEvent = () => {
    // Émettre un événement newGame
    socket.emit('newGame');
};

export const emitJoiningEvent = (room) => {
    // Émettre un événement joining en précisant une room
    socket.emit('joining', { room })
};
```

Et les utiliser dans notre composant `Home` !

```javascript
if (newGame) { // Si on demandait à faire une nouvelle partie
    // TODO Appeler le serveur et lui demander de créer une partie !
    emitNewGameEvent();
    console.log('Je demande à appeler le serveur pour créer une nouvelle partie !');
} else {
    // TODO Appeler le serveur et lui demander de rejoindre une partie !
    console.log('Je demande à appeler le serveur pour rejoindre une nouvelle partie !');
    emitJoiningEvent(room);
}
```

Sans oublier les import pour utiliser ces nouvelles fonctions:

```javascript
...
import { initializeSocketConection, disconnectSocket, emitJoiningEvent, emitNewGameEvent} from '../socket';

const Home = () => ...
```

*Tu devrais maintenant observer de nouveaux logs dans ton terminal à la création d'une nouvelle partie (newGame event, joining event)*

## Gérons ces nouveaux événements côté serveur !

Nous allons donc gérer les événements `newGame` et `joining` lancés depuis le client.

```javascript
socket.on('newGame', () => {
    new Promise(makeRoom).then((room) => {
        socket.emit('newGameCreated', room)
    })
});

socket.on('joining', ({room}) => {
    if (rooms.has(room)){
        socket.emit('joinConfirmed')
    }else{
        socket.emit('errorMessage', 'No room with that id found')
    }
});
```
On voit dans la gestion de l'événement `newGame` l'utilisation de `new Promise(...).then(() => {})`

En javascript, une promesse est une instruction lancée de manière asynchrone, ici, l'instruction est `makeRoom` (une fonction que l'on va créer plus bas). 

*[En savoir plus sur l'utilisation de Promise en javascript](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Promise)*

Son résultat sera donc disponnible plus tard, voir jamais si une erreur survient. Si il devient disponnible, nous allons l'utiliser dans le `then(...)`.

Créons donc cette fonction `makeRoom` !

```javascript
...

//Store the room ids mapping to the room property object 
//The room property object looks like this {roomid:str, players:Array(2)}
const rooms = new Map();

//Promise function to make sure room id is unique
const makeRoom = (resolve) =>{
    var newRoomId = randRoom() // Demander un identifiant pour ma room
    while (rooms.has(newRoomId)) { // Tant que cet identifiant est déjà présent dans ma liste de rooms
        newRoomId = randRoom() // J'en demande un nouveau
    }
    rooms.set(newRoomId, { roomId: newRoomId, players: [], board: null }) // Et j'ajoute cette nouvelle room à ma liste
    resolve(newRoomId) // avant de la retourner pour une utilisation dans le .then(...) qu'on a écrit plus haut
}

io.on('connection', ...)
```

Avant d'aller plus loin, je te laisser créer un dossier `utilities` à l'intérieur du dossier `server` pour y ajouter 1 nouveau fichier utilitaires qui nous aidera dans nos développements.

Un premier fichier `utils.js` : 

```javascript
const randRoom = () => {
    var result = '';
    var hexChars = '0123456789abcdef';
    for (var i = 0; i < 16; i += 1) {
        result += hexChars[Math.floor(Math.random() * 16)];
    }
    return result;
}

const randPiece = () => {
    return Math.random() > 0.5 ? 'X':'O'
}

module.exports = {randRoom, randPiece};
```

Afin d'utiliser la fonction `randRoom`, il faut bien sûr l'importer dans notre fichier `index.js`. ;)

```javascript
//utilities functions and classes
const {randRoom, randPiece} = require('./utilities/utils')

...
```

*À ce stade, tu devrais pouvoir créer ou rejoindre une partie et être redirigé vers une nouvelle page où rien n'est encore affiché... C'est normal, il s'agit du cas où le serveur à confirmé notre participation et nous a redirigé vers une nouvelle page ``<Redirect to={`/game?room=${room}&name=${name}`} />``. N'hésite pas à prendre le temps de bien comprendre tout ça avant de passer à la partie suivante où nous allons créer cette nouvelle page*

## Création de la page de jeu

Dans ta première observation, tu as sans doute remarqué la présence du fichier `AppRouter.js` avec à l'intérieur ces lignes

```javascript
    <Router>
        <Home path='/' exact component={Home} />
    </Router>
```

Nous avons donc créé un composant `AppRouter` où nous gérons le routing de notre application web à l'aide d'une librairie (`react-router-dom`, visible dans les `import`).

Actuellement, nous ne gérons qu'une seule route, la route `/`, ce qui signifie qu'en tapant dans ton navigateur `localhost:3000`, tu seras redirigé vers le composant `Home` sur lequel on travaille depuis le début.

Tu l'as observé dans la partie précédente, nous avons une redirection vers une page `/game` (avec 2 paramètres, mais nous ne les prenons pas en compte ici).

Ajoutons donc une nouvelle gestion de route pour le cas de `/game`:

```javascript
...
import Game from './containers/Game';

const AppRouter = () => (
    <Router>
        <Route path='/' exact component={Home} />
        <Route path='/game' component={Game} />
    </Router>
)

...
```

Et créons un nouveau fichier appelé `Game.js` dans le dossier des `containers`.

Pour le moment, on se contente d'un composant dans sa forme la plus simple, affichant un paragraph indiquant que le jeu est lancé !

```javascript
import React from 'react';

const Game = () => {
    return (
        <div>New game is started !</div>
    )
}

export default Game;
```

*Tu devrais alors pouvoir lancer une nouvelle partie et atterir sur cette page...*

## Signalons au serveur que nous avons rejoint une partie !

Comme pour le composant `Home`, nous allons ajouter un state pour définir quelques paramètres.

```javascript
const Game = () => {
    const [game, setGame] = React.useState(new Array(9).fill(null)); // État du jeu, un tableau sans aucun coup pour commencer
    const [turn, setTurn] = React.useState(true); // Est-ce que c'est à nous de jouer ?
    const [end, setEnd] = React.useState(false); // Est-ce que c'est la fin de la partie ?
    const [room, setRoom] = React.useState(''); // la salle de jeu
    const [statusMessage, setStatusMessage] = React.useState(''); // Un message concernant l'état du jeu
    const [currentPlayerScore, setCurrentPlayerScore] = React.useState(0); // Le score du joueur
    const [opponentPlayer, setOpponentPlayer] = React.useState({}); // L'autre joueur
    const [waiting, setWaiting] = React.useState(false); // Est-ce que on est entrain d'attendre l'autre joueur ?
    const [joinError, setJoinError] = React.useState(false); // Est-ce qu'il y a eu une erreur pour joindre la partie ?
    let socketId = '';
    let piece = '';

    return (
        <div>New game is started !</div>
    )
}
```

*Bon... Ce `<div>` est bien sympa mais nous on aimerait quand même afficher des choses plus sympa !*

Allons-y ! Et comme pour `Home`, nous allons écrire une fonction `getGameByState` qui sera responsable de nous afficher des choses différentes selon l'état de notre state.

```javascript 
...

import Wait from '../components/Wait'
import Status from '../components/Status'
import PlayAgain from '../components/PlayAgain'

const Game = () => {
    ...

    const getGameByState = () => {
        if (joinError) { // Si une erreur est survenue
            return (
                <Redirect to={`/`} /> // On redirige donc vers la page Home
            )
        } else {
            return (
                <>
                    <Wait display={waiting} room={room} />
                    <Status message={statusMessage} />
                    <div className="board">
                        Here we will develop our awesome board
                    </div>
                    <PlayAgain end={end} onClick={() => {}} />
                </>
            )
        }
    };

    return getGameByState();
}

...
```

Tu remarques que l'on a utilisé de nouveaux composants: `Wait`, `Status`, `PlayAgain`...Je te laisse donc créer les fichiers correspondants dans le dossier `components` !

Pour le fichier `Wait.js`:

```javascript
import React, { useRef } from 'react';

const Wait = ({ room, display }) => {
    const textArea = useRef(null)
    const onClick = () => {
        textArea.current.select()
        document.execCommand('copy')
    }

    return (
        <div className='wait' style={{ display: display ? 'flex' : 'none' }}>
            <h1 className="wait-message">Waiting for player to connect...</h1>
            <div className="copy">
                <h1 className='copy-message'>Give your friend the following room id to connect</h1>
                <div className='copy-container'>
                    <input ref={textArea} readOnly={true} value={room} className='copy-area' />
                    <button className='copy-button' onClick={onClick}>Copy</button>
                </div>
            </div>
        </div>
    );
}

export default Wait;
```

Pour le fichier `Status.js`:

```javascript 
import React from 'react'

export default function Status({ message }) {
    return (
        <div className='status'>
            <h1 className="status-message">{message}</h1>
        </div>
    )
};
```

Et pour terminer le fichier `PlayAgain.js`:

```javascript
import React from 'react'

export default function PlayAgain({ end, onClick }) {
    return (
        <div className='again-container'>
            <button className='again-button' onClick={onClick} style={{ visibility: end ? 'visible' : 'hidden', opacity: end ? '1' : '0' }}>Play Again</button>
        </div>
    )
}
```

*J'ai toujours rien de fou qui s'affiche ! Comment ça se fait ?*

Et bien à ce stade, nous n'avons pas encore communiqué avec notre serveur pour lui indiquer que nous venions de rejoindre une nouvelle partie, il faudrait ajouter un peu de code pour gérer tout ça...

## Communiquer avec le serveur

Au dessus de la fonction `getGameByState`, nous allons insérer un `useEffect` comme nous l'avons fait pour la home page

```javascript 
    React.useEffect(() => {
        let socket = initializeSocketConection();
        //Getting the room and the username information from the url
        //Then emit to back end to process
        const { room, name } = QueryString.parse(window.location.search, {
            ignoreQueryPrefix: true
        })
        setRoom(room);
        socket.emit('newRoomJoin', { room, name })

        //New user join, logic decide on backend whether to display 
        //the actual game or the wait screen or redirect back to the main page
        socket.on('waiting', () => {
            setWaiting(true);
            setCurrentPlayerScore(0);
            setOpponentPlayer([]);
        });
        return () => {socket = null;}
    }, []);
```

Côté serveur désormais, nous avions précédemment préparer plusieurs gestion d'événements dont `newRoomJoin`, c'est ce que l'on va modifier !

```javascript
socket.on('newRoomJoin', ({ room, name }) => {
        console.log('newRoomJoin event received !', room);
        
        //If someone tries to go to the game page without a room or name then
        //redirect them back to the start page
        if (room === '' || name === '') {
            io.to(socket.id).emit('joinError')
        }

        //Put the new player into the room
        socket.join(room)
        const id = socket.id
        const newPlayer = new Player(name, room, id)
        joinRoom(newPlayer, room)

        //Get the number of player in the room
        const peopleInRoom = getRoomPlayersNum(room)

        //Need another player so emit the waiting event
        //to display the wait screen on the front end
        if (peopleInRoom === 1) {
            io.to(room).emit('waiting')
        }

        //The right amount of people so we start the game
        if (peopleInRoom === 2) {
            //Assign the piece to each player in the backend data structure and then
            //emit it to each of the player so they can store it in their state
            pieceAssignment(room)
            currentPlayers = rooms.get(room).players
            for (const player of currentPlayers) {
                console.log(player);
                io.to(player.id).emit('pieceAssignment', { playerPiece: player.piece, id: player.id })
            }
            newGame(room)

            //When starting, the game state, turn and the list of both players in
            //the room are required in the front end to render the correct information
            const currentRoom = rooms.get(room)
            const gameState = currentRoom.board.game
            const turn = currentRoom.board.turn
            const players = currentRoom.players.map((player) => ({id : player.id, name : player.name}))
            io.to(room).emit('starting', { gameState, players, playerTurn : turn })
        }

        //Too many people so we kick them out of the room and redirect 
        //them to the main starting page
        if (peopleInRoom === 3) {
            socket.leave(room)
            kick(room)
            io.to(socket.id).emit('joinError')
        }
    })
```

On va maintenant créer les éléments utilisées un par un. Tout d'abord, créons un fichier `player.js` dans le dossier `utilities` et insérons le contenu suivant :

```javascript
class Player {
    constructor(name, room, id, piece='') {
        this.name = name
        this.room = room
        this.id = id
        this.piece = piece
    }
}

module.exports = Player
```

Puis un fichier `board.js` contenant :

```javascript
class Board{
    constructor() {
        this.game = new Array(9).fill(null);
        this.winStates = [
            [0, 1, 2], [3, 4, 5],[6, 7, 8],
            [0, 3, 6], [1, 4, 7],[2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ]
        this.end = false
        this.turn = 'X'
        this.switch = new Map([['X', 'O'], ['O', 'X']])
    }

    move(index, piece){
        if (!this.game[index] && !this.end){
            const newState = [...this.game]
            newState.splice(index, 1, piece)
            this.game = newState
        }
    }

    switchTurn(){
        this.turn = this.switch.get(this.turn)
    }

    checkWinner(player){
        return this.winStates.some(state =>(
          state.every((position => this.game[position] === player))
        ))
    }
    
    checkDraw(){
        return this.game.every(value => value !== null)
    }

    reset(){
        this.game = new Array(9).fill(null)
        this.tur = 'X'
    }
}

module.exports = Board
```

Nous nous intéresserons à leur contenu plus tard. N'oublions pas d'importer ces fichiers:

```javascript
const Player = require('./utilities/player')
const Board = require('./utilities/board')

...
```

En dessous de la fonction `makeRoom`, nous allons ensuite créer la fonction `joinRoom`:

```javascript
//Put the newly joined player into a room's player list 
const joinRoom = (player, room) => {
    currentRoom = rooms.get(room);
    updatedPlayerList = currentRoom.players.push(player)
    updatedRoom = { ...currentRoom, players: updatedPlayerList }
}
```

puis la fonction `getRoomPlayersNum`:

```javascript 
//Check how many player is currently in the room
function getRoomPlayersNum(room) {
    return rooms.get(room).players.length
}
```

Puis la fonction `pieceAssignment`:

```javascript
//Assign x o values to each of the player class
function pieceAssignment(room) {
    const firstPiece = randPiece()
    const lastPiece = firstPiece === 'X' ? 'O' : 'X'

    currentRoom = rooms.get(room)
    currentRoom.players[0].piece = firstPiece
    currentRoom.players[1].piece = lastPiece
}
```

La fonction `newGame`:

```javascript
//Initialize a new board to a room
function newGame(room) {
    currentRoom = rooms.get(room)
    const board = new Board
    currentRoom.board = board
}
```

Et pour terminer, la fonction `kick`: 

```javascript 
//Remove the latest player joined from a room's player list 
function kick(room) {
    currentRoom = rooms.get(room)
    currentRoom.players.pop()
}
```