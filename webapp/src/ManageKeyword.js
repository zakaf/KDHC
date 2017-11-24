import React from 'react';
import {Button} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import './css/Card.css';

export class ManageKeyword extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            keywords: null
        };
        this.loadData = this.loadData.bind(this);
    }

    loadData() {
        let config = require('./config/config.js');

        fetch(config.config.serverUrl + "/news/" + this.props.sub,
            {headers: {'Authorization': 'Bearer ' + this.props.idToken}})
            .then(response => response.json())
            .then(json => {
                this.setState({
                    keywords: json
                })
            })
    }

    addKeyword() {
        let config = require('./config/config.js');

        let keyword = 'keyword';
        let url = 'url';

        fetch(config.config.serverUrl + "/addKeyword",
            {
                method: 'post',
                headers: {'Authorization': 'Bearer ' + this.props.idToken, 'Content-Type': 'application/json'},
                body: JSON.stringify({
                    keyword: keyword,
                    url: url
                })
            })
            .then(response => response.json())
            .then(json => {
            })
    }

    componentDidMount() {
        this.loadData();
    }

    render() {
        if (!this.state.keywords) {
            return null;
        }

        return (
            <div>
                <Button
                    as='a'
                    onClick={this.addKeyword.bind(this)}
                >
                    Add Keyword
                </Button>
            </div>
        )
    }
}

export default ManageKeyword
