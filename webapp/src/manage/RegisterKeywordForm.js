import React from 'react';
import {Form, Header, Icon, Label} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

export class RegisterKeywordForm extends React.Component {
    handleChange = (e, {name, value}) => this.setState({[name]: value});
    handleSubmit = () => {
        this.props.addKeyword(this.state.newKeyword, this.state.newSearchWord);
    };

    constructor(props) {
        super(props);
        this.state = {
            newKeyword: '',
            newSearchWord: '',
        };
    }

    render() {
        return (
            <div>
                <Header as='h2' icon>
                    <Icon name='settings'/>
                    등록할 키워드
                </Header>
                <Form onSubmit={this.handleSubmit}>
                    <Label as='a' tag size='large' color='green'>네이버</Label>
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

export default RegisterKeywordForm
