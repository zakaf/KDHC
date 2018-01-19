import React from 'react';
import {Divider} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import KeywordList from "./KeywordList";
import RegisterKeywordForm from "./RegisterKeywordForm";
import DismissibleMessage from "./DismissibleMessage";

const config = require('./config/config.js');

export class ManageKeyword extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
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
        fetch(config.serverUrl + "/addKeyword",
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
                if (json.status === 'success')
                    this.setSuccessMessage('"' + keyword + '" 추가에 성공하였습니다.');
                else
                    this.setErrorMessage('"' + keyword + '" 추가에 실패하였습니다.');
                this.loadData();
            }).catch(() => {
            this.setErrorMessage('"' + keyword + '" 추가에 실패하였습니다.');
        });
    }

    deleteKeyword(keyword) {
        fetch(config.serverUrl + "/deleteKeyword",
            {
                method: 'post',
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
        fetch(config.serverUrl + "/listKeyword", {
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
        return (
            <div>
                <DismissibleMessage visible={this.state.showMessage} handleDismiss={this.dismissMessage}
                                    isSuccess={this.state.isSuccess} content={this.state.content}/>
                <RegisterKeywordForm addKeyword={this.addKeyword}/>
                <Divider section/>
                <KeywordList keywords={this.state.keywords} deleteKeyword={this.deleteKeyword}/>
            </div>
        )
    }
}

export default ManageKeyword
