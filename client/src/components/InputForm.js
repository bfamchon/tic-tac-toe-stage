import React from 'react';
import ChoiceButton from './ChoiceButton'

const InputForm = ({ stepBack, onSubmit, onTyping, newGame, name, room }) => {
    if (newGame) {
        return (
            <div className="input-container">
                <input
                    name='name'
                    placeholder='Your Name...'
                    onChange={onTyping}
                    value={name}
                />
                <div className='nav-container'>
                    <ChoiceButton type='nav-back' choice='back' onClick={stepBack} label='Back' />
                    <ChoiceButton type='nav-forward' choice='submit' onClick={onSubmit} label="Let's Go" />
                </div>
            </div>
        );
    } else {
        return (
            <div className="input-container">
                <input
                    name='name'
                    placeholder='Your Name...'
                    onChange={onTyping}
                    value={name}
                />
                <input
                    name='room'
                    placeholder='Room ID...'
                    onChange={onTyping}
                    value={room}
                />
                <div className='nav-container'>
                    <ChoiceButton type='nav-back' choice='back' onClick={stepBack} label='Back' />
                    <ChoiceButton type='nav-forward' choice='submit' onClick={onSubmit} label="Let's Go" />

                </div>
            </div>
        );
    }

}

export default InputForm;