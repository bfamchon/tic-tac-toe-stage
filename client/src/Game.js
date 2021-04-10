import React from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom'

import Home from './containers/Home';


const Game = () => (
    <Router>
        <Home path='/' exact component={Home} />
    </Router>
)
 
export default Game;