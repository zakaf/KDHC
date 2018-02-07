import React from 'react'
import {Message} from 'semantic-ui-react'

class DismissibleMessage extends React.Component {

    render() {
        if (this.props.visible) {
            if (this.props.isSuccess) {
                return (
                    <Message
                        success
                        onDismiss={this.props.handleDismiss}
                        header="성공"
                        content={this.props.content}
                        floating
                    />
                )
            } else {
                return (
                    <Message
                        error
                        onDismiss={this.props.handleDismiss}
                        header="실패"
                        content={this.props.content}
                        floating
                    />
                )
            }
        }
        else
            return (
                <div/>
            );
    }
}

export default DismissibleMessage