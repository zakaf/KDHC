import React from 'react';
import './App.css';
import AppHeader from './AppHeader';
import Body from './Body'
import 'semantic-ui-css/semantic.min.css';

class App extends React.Component {
    render() {
        return (
            <div>
                <AppHeader/>
                <Body/>
            </div>
        );
    }
}

export default App;
