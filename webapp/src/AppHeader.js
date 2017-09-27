import React from 'react';
import {Button, Container, Header, Icon, Menu, Segment} from 'semantic-ui-react'
import {NavLink} from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css';

class AppHeader extends React.Component {
    render() {
        return (
            <Segment
                inverted
                textAlign='center'
                vertical
                padded
            >
                <Container>
                    <Menu inverted pointing secondary size='large'>
                        <Menu.Item name="news" as={NavLink} to='/news'>News</Menu.Item>
                        <Menu.Item name="keyword" as={NavLink} to='/keyword'>Keyword</Menu.Item>
                        <Menu.Item position='right'>
                            <Button as={NavLink} inverted to='/login'>Log in</Button>
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