import React from 'react';
import {Button, Header, List} from 'semantic-ui-react';
import TimeAgo from 'react-timeago';
import 'semantic-ui-css/semantic.min.css';

export class KeywordList extends React.Component {
    render() {
        if (!this.props.keywords) {
            return null;
        }

        return (
            <div>
                <Header as='h2' textAlign='center'>
                    등록된 키워드
                </Header>
                <List divided>
                    {
                        this.props.keywords.map((row) => {
                            return (<List.Item key={row.keyword}>
                                    <Button onClick={() => this.props.deleteKeyword(row.keyword)} floated='right'>
                                            Delete
                                    </Button>
                                    <List.Icon name='newspaper' size='large'/>
                                    <List.Content>
                                        <List.Header>
                                            <Header floated='left' size='small'>
                                                {row.keyword}
                                            </Header>
                                        </List.Header>
                                        <List.Content floated='left'>
                                            <List.Description><TimeAgo date={row.mod_dtime}/></List.Description>
                                        </List.Content>
                                    </List.Content>
                                </List.Item>
                            )
                        })
                    }
                </List>
            </div>
        )
    }
}

export default KeywordList
