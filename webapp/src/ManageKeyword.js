import React from 'react';
import {Divider} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import KeywordList from "./KeywordList";
import RegisterKeyword from "./RegisterKeyword";

export class ManageKeyword extends React.Component {
    render() {
        return (
            <div>
                <RegisterKeyword sub={this.props.sub} idToken={this.props.idToken}/>
                <Divider section/>
                <KeywordList sub={this.props.sub} idToken={this.props.idToken}/>
            </div>
        )
    }
}

export default ManageKeyword
