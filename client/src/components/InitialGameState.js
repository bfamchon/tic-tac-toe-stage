import React from 'react';
import ChoiceButton from './ChoiceButton' // Un nouveau composant à créer plus tard !

const InitialGameState = ({ onChoice }) => { // On voit ici un passage de propriétés à notre composant, si tu regardes bien dans Home, on a écrit onChoice={() => {}} (une fonction fléchée vide)... Et on retrouve ce onChoice ici !
    return (
        <>
            <div className='choice-container'>
                <ChoiceButton onClick={() => onChoice('new')} type='primary' label='Start New Game' />
                <ChoiceButton onClick={() => onChoice('join')} type='secondary' label='Join A Game' />
            </div>
        </>
    );
}

export default InitialGameState;