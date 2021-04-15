import React from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom'

import Home from './containers/Home';
import Game from './containers/Game';


const AppRouter = () => (
    <Router>
        <Route path='/' exact component={Home} />
        <Route path='/game' component={Game} />
    </Router>
)
 
export default AppRouter;