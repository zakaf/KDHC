import React from 'react';
import './App.css';
import AppHeader from './AppHeader';
import Body from './Body'
import Auth from './Auth'
import 'semantic-ui-css/semantic.min.css';

class App extends React.Component {
    render() {
        const auth = new Auth();

        return (
            <div>
                <AppHeader auth={auth}/>
                <Body auth={auth}/>
            </div>
        );
    }
}

export default App;
