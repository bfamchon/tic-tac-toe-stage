import React from 'react';
import { Redirect } from 'react-router-dom'

import InitialGameState from '../components/InitialGameState';
import Loading from '../components/Loading';
import Error from '../components/Error';
import InputForm from '../components/InputForm';

import { initializeSocketConection, disconnectSocket, emitJoiningEvent, emitNewGameEvent} from '../socket';

const Home = () => {
    const [step, setStep] = React.useState(1); // Étape du jeu, on considère l'étape 1 comme étant l'état initial...
    const [name, setName] = React.useState(''); // Nom du joueur
    const [newGame, setNewGame] = React.useState(null); // Est-ce qu'on lance un nouveau jeu ?
    const [room, setRoom] = React.useState(''); // La salle de jeu
    const [loading, setLoading] = React.useState(false); // Est-ce que mon jeu est entrain de charger qqch ?
    const [serverConfirmed, setServerConfirmed] = React.useState(false); // Est-ce que le serveur a confirmé notre participation ?
    const [error, setError] = React.useState(false); // Est-ce qu'il y a eu une erreur ?
    const [errorMessage, setErrorMessage] = React.useState(''); // Le message d'erreur

    const stepBack = () => {
        setStep(step - 1);
    }

    const stepForward = () => {
        setStep(step + 1);
    }

    const onInitialGameStateButtonClicked = (choice) => {
        const gameChoice = choice === 'new' ? true : false; // cette notation s'appelle une ternaire et correspond à un IF/ELSE, écrit différemment
        setNewGame(gameChoice); // Est-ce que l'on veut lancer une nouvelle partie ou la rejoindre ?
        stepForward(); // On avance notre étape du jeu !
    };

    const onUserWritingSomething = (event) => { // cette fonction prend en paramètre un événement
        const target = event.target.name; // On récupère l'émetteur de l'event
        const value = event.target.value; // Et la valeur associée
        if (target === 'name') { // Si l'émetteur a pour nom 'name'
            setName(value); // Alors on change le nom dans le state...
        } else if (target === 'room') { // Si l'émetteur a pour nom 'room'
            setRoom(value); // Alors on change la room dans le state...
        }
    }

    const isMyFormValid = () => {
        if (newGame) {
            return name !== '';
        } else {
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
                emitNewGameEvent()
                console.log('Je demande à appeler le serveur pour créer une nouvelle partie !')
            } else {
                // TODO Appeler le serveur et lui demander de rejoindre une partie !
                console.log('Je demande à appeler le serveur pour rejoindre une nouvelle partie !')
                emitJoiningEvent(room);
            }
        } else { // Oops... Le formulaire n'est pas valide !
            displayError(newGame ? 'Please fill out your name' : 'Please fill out your name and room id') // On demande à afficher un message d'erreur.
        }
    }

    React.useEffect(() => {
        let socket = initializeSocketConection();
        socket.on('newGameCreated', (room) => {
            setRoom(room);
            setServerConfirmed(true);
        })
        socket.on('joinConfirmed', () => {
            setServerConfirmed(true);
        })
        socket.on('errorMessage', (message) => displayError(message));
        return () => {socket = null};
    }, []);

    const getHomeByGameState = () => {
        if (serverConfirmed) { // Si le serveur à confirmé notre participation
            return (// alors on est redirigé dans une partie
                <Redirect to={`/game?room=${room}&name=${name}`} />
            )
        } else { // Si ce n'est pas le cas
            switch (step) {
                case (1): // Et que l'on se trouve dans l'état de jeu initial (1)
                    return ( // On affiche les éléments de l'état initial du jeu (nouvelle partie ou rejoindre)
                        <InitialGameState onChoice={onInitialGameStateButtonClicked} />
                    );
                case (2):
                    return (
                        <>
                            <Loading loading={loading} />
                            <Error display={error} message={errorMessage} />
                            <InputForm
                                stepBack={stepBack}
                                onSubmit={onUserSubmitHisForm}
                                onTyping={onUserWritingSomething}
                                newGame={newGame}
                                name={name}
                                room={room} />
                        </>
                    );
                default: // Le cas par défaut est de ne rien retourner.
                    return null
            }
        }
    }
    
    return getHomeByGameState(); // On appelle la fonction déclarée plus haut qui va nous retourner des éléments à afficher...
}

export default Home;