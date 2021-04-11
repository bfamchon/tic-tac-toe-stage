import React from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom'

import Home from './containers/Home';


const AppRouter = () => (
    <Router>
        <Route path='/' exact component={Home} />
    </Router>
)
 
export default AppRouter;