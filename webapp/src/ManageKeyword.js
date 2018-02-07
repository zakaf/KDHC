import React from 'react';
import {Menu, Segment} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import KeywordList from "./KeywordList";
import RegisterKeywordForm from "./RegisterKeywordForm";
import DismissibleMessage from "./DismissibleMessage";
import PrivacyPolicy from './PrivacyPolicy';

const config = require('./config/config.js');

export class ManageKeyword extends React.Component {
    handleItemClick = (e, {name}) => this.setState({activeItem: name});

    constructor(props) {
        super(props);
        this.state = {
            activeItem: 'listKeyword',
            keywords: null,
            showMessage: false,
            isSuccess: true,
            content: null
        };

        this.dismissMessage = this.dismissMessage.bind(this);
        this.addKeyword = this.addKeyword.bind(this);
        this.deleteKeyword = this.deleteKeyword.bind(this);
        this.loadData = this.loadData.bind(this);
    }

    setSuccessMessage(content) {
        this.setMessage(true, content);
    }

    setErrorMessage(content) {
        this.setMessage(false, content);
    }

    setMessage(isSuccess, content) {
        this.setState({
            showMessage: true,
            isSuccess: isSuccess,
            content: content
        })
    }

    dismissMessage() {
        this.setState({showMessage: false});
    };

    addKeyword(keyword, searchWord) {
        fetch(config.serverUrl + "/keyword",
            {
                method: 'put',
                headers: {'Authorization': 'Bearer ' + this.props.idToken, 'Content-Type': 'application/json'},
                body: JSON.stringify({
                    type: 'NAVER',
                    keyword: keyword,
                    searchWord: searchWord,
                })
            })
            .then(response => response.json())
            .then(json => {
                if (json.status === 'success') {
                    this.setSuccessMessage('"' + keyword + '" 추가에 성공하였습니다.');
                    this.loadData();
                }
                else
                    this.setErrorMessage('"' + keyword + '" 추가에 실패하였습니다.');
            }).catch(() => {
            this.setErrorMessage('"' + keyword + '" 추가에 실패하였습니다.');
        });
    }

    deleteKeyword(keyword) {
        fetch(config.serverUrl + "/keyword",
            {
                method: 'delete',
                headers: {'Authorization': 'Bearer ' + this.props.idToken, 'Content-Type': 'application/json'},
                body: JSON.stringify({
                    keyword: keyword,
                })
            })
            .then(response => response.json())
            .then(json => {
                if (json.status === 'success')
                    this.setSuccessMessage('"' + keyword + '" 삭제에 성공하였습니다.');
                else
                    this.setErrorMessage('"' + keyword + '" 삭제에 실패하였습니다.');
                this.loadData();
            }).catch(() => {
            this.setErrorMessage('"' + keyword + '" 삭제에 실패하였습니다.');
        });
    }

    loadData() {
        fetch(config.serverUrl + "/keyword", {
            headers: {
                'Authorization': 'Bearer ' + this.props.idToken,
                'Cache-Control': 'no-cache'
            }
        })
            .then(response => response.json())
            .then(json => {
                if (json.status === 'success') {
                    //새로고침을 위해 강제로 데이터 초기화 후 지정해준다.
                    this.setState({keywords: null});
                    this.setState({keywords: json.data});
                }
                else
                    this.setErrorMessage('새로고침에 실패하였습니다.');
            }).catch(() => {
            this.setErrorMessage('새로고침에 실패하였습니다.');
        });
    }

    componentDidMount() {
        this.loadData();
    }

    render() {
        const {activeItem} = this.state;

        let content = null;

        if (activeItem === 'addKeyword')
            content = (<RegisterKeywordForm addKeyword={this.addKeyword}/>);
        else if (activeItem === 'listKeyword')
            content = (<KeywordList keywords={this.state.keywords} deleteKeyword={this.deleteKeyword}/>);
        else if (activeItem === 'privacyPolicy')
            content = (<PrivacyPolicy/>);

        return (
            <div>
                <Menu attached='top' pointing>
                    <Menu.Item name='listKeyword' active={activeItem === 'listKeyword'} onClick={this.handleItemClick}/>
                    <Menu.Item name='addKeyword' active={activeItem === 'addKeyword'} onClick={this.handleItemClick}/>
                    <Menu.Menu position='right'>
                        <Menu.Item name='privacyPolicy' active={activeItem === 'privacyPolicy'}
                                   onClick={this.handleItemClick}/>
                    </Menu.Menu>
                </Menu>

                <Segment>
                    <DismissibleMessage visible={this.state.showMessage} handleDismiss={this.dismissMessage}
                                        isSuccess={this.state.isSuccess} content={this.state.content}/>
                    {content}
                </Segment>
            </div>
        )
    }
}

export default ManageKeyword
