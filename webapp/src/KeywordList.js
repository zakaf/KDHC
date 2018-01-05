import React from 'react';
import {Button, Header, List, Message} from 'semantic-ui-react';
import TimeAgo from 'react-timeago';
import 'semantic-ui-css/semantic.min.css';

export class KeywordList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            keyword: null,
            messageType: null,
            messageHeader: null,
            messageContent: null
        };
        this.loadData = this.loadData.bind(this);
    }

    loadData() {
        let config = require('./config/config.js');

        fetch(config.config.serverUrl + "/listKeyword",
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

    deleteKeyword(keyword) {
        let config = require('./config/config.js');

        fetch(config.config.serverUrl + "/deleteKeyword",
            {
                method: 'post',
                headers: {'Authorization': 'Bearer ' + this.props.idToken, 'Content-Type': 'application/json'},
                body: JSON.stringify({
                    keyword: keyword,
                })
            })
            .then(response => response.json())
            .then(json => {
                if (json.keyword === keyword) {
                    this.setState({messageType: 'S'});
                    this.setState({messageHeader: '삭제 성공'});
                    this.setState({messageContent: '"' + json.keyword + '" 삭제에 성공하였습니다.'});
                } else {
                    this.handleError();
                }
            }).catch(() => {
            this.handleError();
        });
    }

    handleError() {
        this.setState({messageType: 'E'});
        this.setState({messageHeader: '삭제 실패'});
        this.setState({messageContent: '키워드 삭제에 실패하였습니다.'});
    }

    renderMessage() {
        if (this.state.messageType === 'S')
            return (
                <Message
                    success
                    header={this.state.messageHeader}
                    content={this.state.messageContent}
                />
            );
        else if (this.state.messageType === 'E')
            return (
                <Message
                    error
                    header={this.state.messageHeader}
                    content={this.state.messageContent}
                />
            );
        else
            return '';
    }

    render() {
        if (!this.state.keyword) {
            return null;
        }

        return (
            <div>
                <Header as='h2' textAlign='center'>
                    등록된 키워드
                </Header>
                {this.renderMessage()}
                <List divided>
                    {
                        this.state.keyword.map((row) => {
                            return (<List.Item key={row.keyword}>
                                    <Button onClick={() => this.deleteKeyword(row.keyword)} floated='right'>
                                            Delete
                                    </Button>
                                    <List.Icon name='newspaper' size='large'/>
                                    <List.Content>
                                        <List.Header>
                                            <Header floated='left' size='small'>
                                                {row.keyword}
                                            </Header>
                                        </List.Header>
                                        <List.Content floated='left'>
                                            <List.Description><TimeAgo date={row.mod_dtime}/></List.Description>
                                        </List.Content>
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
