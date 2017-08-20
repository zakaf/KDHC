import React from 'react';
import {Button, Container, Header, Icon, Menu, Segment} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css';

class AppHeader extends React.Component {
    constructor(props) {
        super(props);
        this.handleItemClick = this.handleItemClick.bind(this);
    }

    handleItemClick(e, {name}) {
        this.props.moveToPage(name);
    }

    render() {
        return (
            <Segment
                inverted
                textAlign='center'
                vertical
                padded='very'
            >
                <Container>
                    <Menu inverted pointing secondary size='large'>
                        <Menu.Item name="news" active={this.props.page === 'news'}
                                   onClick={this.handleItemClick}>News</Menu.Item>
                        <Menu.Item name="keyword" active={this.props.page === 'keyword'} onClick={this.handleItemClick}>Keyword</Menu.Item>
                        <Menu.Item position='right'>
                            <Button as='a' inverted>Log in</Button>
                            <Button as='a' inverted style={{marginLeft: '0.5em'}}>Sign Up</Button>
                        </Menu.Item>
                    </Menu>
                </Container>
                <Container text>
                    <Header as='h2' icon textAlign='center' inverted>
                        <Icon name='newspaper' circular/>
                        <Header.Content>
                            KDHC
                        </Header.Content>
                    </Header>
                </Container>
            </Segment>
        );
    }
}

export default AppHeader;