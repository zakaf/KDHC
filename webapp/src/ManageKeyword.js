import React from 'react';
import {Divider, Form, Header, Icon, Label, Message} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import './css/Card.css';
import {KeywordList} from "./KeywordList";

export class ManageKeyword extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            keywords: null,
            newKeyword: '',
            newSearchWord: '',
            isMessageSuccess: '',
            isMessageError: '',
            messageHeader: '',
            messageContent: ''
        };
        this.loadData = this.loadData.bind(this);
    }

    componentDidMount() {
        this.loadData();
    }

    handleChange = (e, {name, value}) => this.setState({[name]: value});

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

    handleSubmit = () => {
        this.addKeyword(this.state.newKeyword, this.state.newSearchWord);
    };

    addKeyword(keyword, searchWord) {
        let config = require('./config/config.js');

        fetch(config.config.serverUrl + "/addKeyword",
            {
                method: 'post',
                headers: {'Authorization': 'Bearer ' + this.props.idToken, 'Content-Type': 'application/json'},
                body: JSON.stringify({
                    type: 'NAVER',
                    keyword: keyword,
                    searchWord: searchWord,
                })
            })
            .then(response => response.json())
            .then(json => {
                if (json.keyword === keyword && json.searchWord === searchWord) {
                    this.setState({isMessageSuccess: 'true'});
                    this.setState({isMessageError: ''});
                    this.setState({messageHeader: '저장 성공'});
                    this.setState({messageContent: '"' + json.keyword + '" 저장에 성공하였습니다.'});
                    this.setState({newKeyword: ''});
                    this.setState({newSearchWord: ''});
                } else {
                    this.handleError();
                }
            }).catch(() => {
            this.handleError();
        });
    }

    handleError() {
        this.setState({isMessageError: 'true'});
        this.setState({isMessageSuccess: ''});
        this.setState({messageHeader: '저장 실패'});
        this.setState({messageContent: '키워드 저장에 실패하였습니다.'});
    }

    render() {
        return (
            <div>
                <Header as='h2' icon>
                    <Icon name='settings'/>
                    등록할 키워드
                </Header>

                <Form onSubmit={this.handleSubmit} success={this.state.isMessageSuccess}
                      error={this.state.isMessageError}>
                    <Label as='a' tag size='large' color='green'>네이버</Label>
                    <Form.Group>
                        <Form.Input name='newKeyword' label='키워드' placeholder='키워드' width={4}
                                    onChange={this.handleChange}/>
                        <Form.Input name='newSearchWord' label='검색어' placeholder='검색어' width={12}
                                    onChange={this.handleChange}/>
                    </Form.Group>
                    <Form.Button content="키워드 추가"/>
                    <Message
                        success
                        header={this.state.messageHeader}
                        content={this.state.messageContent}
                    />
                    <Message
                        error
                        header={this.state.messageHeader}
                        content={this.state.messageContent}
                    />
                </Form>
                <Divider section/>
                <KeywordList sub={this.props.sub} idToken={this.props.idToken}/>
            </div>
        )
    }
}

export default ManageKeyword
