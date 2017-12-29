import React from 'react';
import {Header, List} from 'semantic-ui-react';
import TimeAgo from 'react-timeago';
import 'semantic-ui-css/semantic.min.css';

export class KeywordList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            keyword: null
        };
        this.loadData = this.loadData.bind(this);
    }

    loadData() {
        let config = require('./config/config.js');

        fetch(config.config.serverUrl + "/listKeyword/" + this.props.sub,
            {headers: {'Authorization': 'Bearer ' + this.props.idToken}})
            .then(response => response.json())
            .then(json => {
                this.setState({
                    keyword: json
                })
            })
    }

    componentDidMount() {
        this.loadData();
    }

    render() {
        if (!this.state.keyword) {
            return null;
        }

        return (
            <div>
                <Header as='h2'>등록된 키워드</Header>

                <List>
                    {
                        this.state.keyword.map(function (row) {
                            return (<List.Item key={row.keyword}>
                                    <List.Icon name='newspaper' size='large'/>
                                    <List.Content>
                                        <List.Header>{row.keyword}</List.Header>
                                        <List.Description><TimeAgo date={row.mod_dtime}/></List.Description>
                                    </List.Content>
                                </List.Item>
                            )
                        })
                    }
                </List>
            </div>
        )
    }
}

export default KeywordList
