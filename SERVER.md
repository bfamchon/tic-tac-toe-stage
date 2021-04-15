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
            setOpponentPlayer({});
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
                io.to(player.id).emit('pieceAssignment', { piece: player.piece, id: player.id })
            }
            newGame(room)

            //When starting, the game state, turn and the list of both players in
            //the room are required in the front end to render the correct information
            const currentRoom = rooms.get(room)
            const gameState = currentRoom.board.game
            const turn = currentRoom.board.turn
            const players = currentRoom.players.map((player) => [player.id, player.name])
            io.to(room).emit('starting', { gameState, players, turn })
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

Dans le `newRoomJoin`, on voit la logique de : "Si l'utilisateur est seul, alors on envoit un événement `waiting`", "si les utilisateurs sont 2, la partie peut être lancée et on envoie à chaque personne leur pièce" (`X` ou `O`) : `io.to(player.id).emit('pieceAssignment', { playerPiece: player.piece, id: player.id })` puis on signale à nos utilisateurs que la partie peut commencer: `io.to(room).emit('starting', { gameState, players, playerTurn : turn })`.

Ces événements, nous allons les réceptionner dans `Game`, sous l'événement `waiting` qui est déjà géré.

```javascript
        ...
        socket.on('starting', ({ gameState, players, playerTurn }) => {
            setWaiting(false);
            gameStart(gameState, players, playerTurn)
        })
        socket.on('joinError', () => setJoinError(true))

        //Listening to the assignment of piece store the piece along with the in state
        //socket id in local socketID variable
        socket.on('pieceAssignment', ({ playerPiece, id }) => {
            console.log('pieceAssignment : ', id, playerPiece);
            piece = playerPiece;
            socketId = id;
        })
        ...
```

Nous allons ensuite créer la fonction `gameStart` ainsi que `decideTurn` au dessus du `React.useEffect(...)`:


```javascript
    ... 
    const decideTurn = (playerTurn) => {
        // Est-ce que ma pièce est celle qui doit jouer ? 
        if (piece === playerTurn) {
            setTurn(true);
        } else {
            setTurn(false);
        }
    };

    //Setting the states to start a game when new user join
    const gameStart = (gameState, players, playerTurn) => {
        console.log('players : ', players);
        console.log('me.id : ', socketId);
        console.log('who s turn ? ', playerTurn);
        console.log('my piece : ', piece);
        const opponent = players.find(player => player.id !== socketId)
        console.log('other player: ',s opponent);
        setOpponentPlayer(opponent);
        setEnd(false);
        setGame(gameState);
        decideTurn(playerTurn)
        setStatusMessage(playerTurn === piece ? 'Your Turn' : `${opponent.name}'s Turn`)
    }
    ...
```

## Plateau & Mouvements

 Nous allons maintenant nous intéresser à l'affichage du plateau et à la gestion des mouvements, comme j'ai un peu merdé on va se contenter de remplacer le composant Game, globalement c'est un la même chose mais écrit différement comme on faisait il y a quelques années. Tu retrouveras peut-être cette façon d'écrire les composants dans tes futurs développement ! 

 ```javascript 
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom'

import Square from '../components/Square';
import Wait from '../components/Wait'
import Status from '../components/Status'
import PlayAgain from '../components/PlayAgain'

import io from 'socket.io-client'
import qs from 'qs'
const ENDPOINT = 'ws://localhost:4000'

class Game extends Component {
    constructor(props) {
        super(props)
        this.state = {
            game: new Array(9).fill(null),
            piece: 'X',
            turn: true,
            end: false,
            room: '',
            statusMessage: '',
            currentPlayerScore: 0,
            opponentPlayer: [],
            //State to check when a new user join
            waiting: false,
            joinError: false
        }
        this.socketID = null
    }

    componentDidMount() {
        //Getting the room and the username information from the url
        //Then emit to back end to process
        this.socket = io(ENDPOINT)
        const { room, name } = qs.parse(window.location.search, {
            ignoreQueryPrefix: true
        })
        this.setState({ room })
        this.socket.emit('newRoomJoin', { room, name })

        //New user join, logic decide on backend whether to display 
        //the actual game or the wait screen or redirect back to the main page
        this.socket.on('waiting', () => this.setState({ waiting: true, currentPlayerScore: 0, opponentPlayer: [] }))
        this.socket.on('starting', ({ gameState, players, turn }) => {
            this.setState({ waiting: false })
            this.gameStart(gameState, players, turn)
        })
        this.socket.on('joinError', () => this.setState({ joinError: true }))

        //Listening to the assignment of piece store the piece along with the in state
        //socket id in local socketID variable
        this.socket.on('pieceAssignment', ({ piece, id }) => {
            this.setState({ piece: piece })
            this.socketID = id
        })

        //Game play logic events
        this.socket.on('update', ({ gameState, turn }) => this.handleUpdate(gameState, turn))
        this.socket.on('winner', ({ gameState, id }) => this.handleWin(id, gameState))
        this.socket.on('draw', ({ gameState }) => this.handleDraw(gameState))

        this.socket.on('restart', ({ gameState, turn }) => this.handleRestart(gameState, turn))
    }

    //Setting the states to start a game when new user join
    gameStart(gameState, players, turn) {
        const opponent = players.filter(([id, name]) => id !== this.socketID)[0][1]
        this.setState({ opponentPlayer: [opponent, 0], end: false })
        this.setBoard(gameState)
        this.setTurn(turn)
        this.setMessage()
    }

    //When some one make a move, emit the event to the back end for handling
    handleClick = (index) => {
        const { game, piece, end, turn, room } = this.state
        if (!game[index] && !end && turn) {
            this.socket.emit('move', { room, piece, index })
        }
    }

    //Setting the states each move when the game haven't ended (no wins or draw)
    handleUpdate(gameState, turn) {
        this.setBoard(gameState)
        this.setTurn(turn)
        this.setMessage()
    }

    //Setting the states when some one wins
    handleWin(id, gameState) {
        this.setBoard(gameState)
        if (this.socketID === id) {
            const playerScore = this.state.currentPlayerScore + 1
            this.setState({ currentPlayerScore: playerScore, statusMessage: 'You Win' })
        } else {
            const opponentScore = this.state.opponentPlayer[1] + 1
            const opponent = this.state.opponentPlayer
            opponent[1] = opponentScore
            this.setState({ opponentPlayer: opponent, statusMessage: `${this.state.opponentPlayer[0]} Wins` })
        }
        this.setState({ end: true })
    }

    //Setting the states when there is a draw at the end
    handleDraw(gameState) {
        this.setBoard(gameState)
        this.setState({ end: true, statusMessage: 'Draw' })
    }

    playAgainRequest = () => {
        this.socket.emit('playAgainRequest', this.state.room)
    }

    //Handle the restart event from the back end
    handleRestart(gameState, turn) {
        this.setBoard(gameState)
        this.setTurn(turn)
        this.setMessage()
        this.setState({ end: false })
    }

    //Some utilities methods to set the states of the board

    setMessage() {
        const message = this.state.turn ? 'Your Turn' : `${this.state.opponentPlayer[0]}'s Turn`
        this.setState({ statusMessage: message })
    }

    setTurn(turn) {
        if (this.state.piece === turn) {
            this.setState({ turn: true })
        } else {
            this.setState({ turn: false })
        }
    }

    setBoard(gameState) {
        this.setState({ game: gameState })
    }

    renderSquare(i) {
        return (
            <Square key={i} value={this.state.game[i]}
                player={this.state.piece}
                end={this.state.end}
                id={i}
                onClick={this.handleClick}
                turn={this.state.turn} />
        )
    }

    render() {
        if (this.state.joinError) {
            return (
                <Redirect to={`/`} />
            )
        } else {
            const squareArray = []
            for (let i = 0; i < 9; i++) {
                const newSquare = this.renderSquare(i)
                squareArray.push(newSquare)
            }
            return (
                <>
                    <Wait display={this.state.waiting} room={this.state.room} />
                    <Status message={this.state.statusMessage} />
                    <div className="board">
                        {squareArray}
                    </div>
                    <PlayAgain end={this.state.end} onClick={this.playAgainRequest} />
                </>
            )
        }
    }
}


export default Game
 ```

Nous voyons ici un nouvel événement `move` qui devra être traité plus tard dans notre serveur... Mais d'abord, créons donc ce composant `Square.js` représantant la case avec ou non l'icône `X` ou `O`;

```javascript
import React from 'react';
import Icon from './icons'

const Square = (props) => {
  return (
    <div className="square" onClick={props.onClick.bind(this, props.id)}>
      <Icon {...props}/> 
    </div>
  );
}

export default Square;
```

Nous allons maintenant gérer l'affichage de l'icône en créant un dossier `icons` dans `components`, il sera composé d'un fichier `index.js`, le point d'entré qui sera appelé implicitement par le composant `Square` dans l'import `import Icon from './icons';`:

```javascript
import React from 'react';
import X from './X'
import O from './O'

const Icon = (props) => {
    switch(props.value){
        case 'X':
            return <X />
        case 'O':
            return <O />
        default:
            if (props.end || !props.turn){
                return <div></div>
            }else{
                switch(props.player){
                    case 'X':
                        return <div className='placeHolder'><X /></div>
                    case 'O':
                        return <div className='placeHolder'><O /></div>
                    default:
                        return <div></div>
                }   
            }
    }
}

export default Icon;
```

Puis deux fichiers pour gérer les icônes X et O, le premier fichier `X.js`: 

```javascript
import React from 'react';

const beforeStyle ={
    background: 'white',
    width: '93%',
    height: '13%',
    position: 'absolute',
    transform: 'rotate(45deg)'
}
const afterStyle ={
    background: 'white',
    width: '93%',
    height: '13%',
    position: 'absolute',
    transform: 'rotate(-45deg)'
}


const X = () => {
    return (
        <>
            <div className="before" style={beforeStyle}></div>
            <div className = "after" style={afterStyle}></div>
        </>
    );
}

export default X;
```

Et le second, `O.js`:

```javascript
import React from 'react';

const beforeStyle ={
    background: 'white',
    width: '90%',
    height: '90%',
    position: 'absolute',
    borderRadius: '50%',
}
const afterStyle ={
    background: 'var(--dark-blue)',
    width: '70%',
    height: '70%',
    position: 'absolute',
    borderRadius: '50%',
}


const O = () => {
    return (
        <>
            <div className="before" style={beforeStyle}></div>
            <div className = "after" style={afterStyle}></div>
        </>
    );
}

export default O;
```

Côté serveur, nous allons gérer l'événement `move` en remplaçant l'existant par 

```javascript
    //Listener event for each move and emit different events depending on the state of the game
    socket.on('move', ({ room, piece, index }) => {
        currentBoard = rooms.get(room).board
        currentBoard.move(index, piece)

        if (currentBoard.checkWinner(piece)) {
            // TODO à l'image de ce qui a été fait pour l'événement 'starting'...
            // TODO ...émettre un événement 'winner' pour la room
            // Avec comme objet `{ gameState: currentBoard.game, id: socket.id }`
        } else if (currentBoard.checkDraw()) {
            // TODO à l'image de ce qui a été fait pour l'événement 'starting'...
            // TODO ...émettre un événement 'draw' pour la room
            // Avec comme objet `{ gameState: currentBoard.game }`
        } else {
            currentBoard.switchTurn();
            // TODO à l'image de ce qui a été fait pour l'événement 'starting'...
            // TODO ...émettre un événement 'update' pour la room
            // Avec comme objet `{ gameState: currentBoard.game, turn: currentBoard.turn }`
        }
    })
```

Après avoir trouvé les événements à lancer dans l'étape précédente, tu devrais pouvoir jouer une partie complète en ouvrant un nouveau navigateur !

À la fin de cette partie, tu verras un bouton pour rejouer... Mais rien ne se passe ! C'est parce-qu'il faudrait gérer cet événement comme il faut côté serveur !

```javascript
    //Listener event for a new game
    socket.on('playAgainRequest', (room) => {
        console.log('playAgainRequest event received !');
        currentRoom = rooms.get(room)
        currentRoom.board.reset()
        //Reassign new piece so a player can't always go first
        pieceAssignment(room)
        currentPlayers = currentRoom.players
        for (const player of currentPlayers) {
            // TODO Ici, on cherche à lancer l'événement `pieceAssignment` pour chaque joueur, comme on l'a fait plus haut dans `newRoomJoin`
        }
        // TODO Ici, on cherche à lancer l'événement `restart` à la room, avec comme objet `{ gameState: currentRoom.board.game, turn: currentRoom.board.turn }`
    })
```

Et Hop, une fois ces événements gérés tu devrais pouvoir relancer une partie ! ;)

## Gestion des scores !