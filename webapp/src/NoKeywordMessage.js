import React from "react";
import {Message} from 'semantic-ui-react';

export class NoKeywordMessage extends React.Component {
    render() {
        return (
            <Message warning>
                <Message.Header>You have no keyword available!</Message.Header>
                Please add a new keyword.
            </Message>
        );
    }
}

export default NoKeywordMessage