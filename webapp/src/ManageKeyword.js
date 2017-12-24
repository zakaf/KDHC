import React from 'react';
import {Form, Label} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import './css/Card.css';

export class ManageKeyword extends React.Component {
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

    constructor(props) {
        super(props);
        this.state = {
            keywords: null,
            newKeyword: '',
            newSearchWord: ''
        };
        this.loadData = this.loadData.bind(this);
    }

    componentDidMount() {
        this.loadData();
    }

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
            })
    }

    render() {
        return (
            <div>
                <Label as='a' tag size='large' color='green'>네이버</Label>
                <Form onSubmit={this.handleSubmit}>
                    <Form.Group>
                        <Form.Input name='newKeyword' label='키워드' placeholder='키워드' width={4}
                                    onChange={this.handleChange}/>
                        <Form.Input name='newSearchWord' label='검색어' placeholder='검색어' width={12}
                                    onChange={this.handleChange}/>
                    </Form.Group>
                    <Form.Button content="키워드 추가"/>
                </Form>
            </div>
        )
    }
}

export default ManageKeyword
