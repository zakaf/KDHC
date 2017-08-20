import React from 'react';
import {Card, Divider, Feed, Icon} from 'semantic-ui-react';
import TimeAgo from 'react-timeago';
import 'semantic-ui-css/semantic.min.css';

export class KeywordCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            keyword: null
        };
        this.loadData = this.loadData.bind(this);
    }

    loadData() {
        fetch("http://localhost:3001/keywords")
            .then(response => response.json())
            .then(json => {
                this.setState({
                    keyword: json
                })
            })
    }

    componentDidMount() {
        this.loadData();
    }

    render() {
        if (!this.state.keyword) {
            return null;
        }

        return (
            <div>
                <Card.Group itemsPerRow="3" stackable>
                    {
                        this.state.keyword.map(function (row) {
                            return (<Card key={row.keyword} header={row.keyword}>
                                <Card.Content>
                                    <Card.Header>
                                        {row.keyword}
                                    </Card.Header>
                                    <Divider/>
                                    {
                                        row.news.map(function (newsRow) {
                                            return (
                                                <Feed key={newsRow.news_url}>
                                                    <Feed.Event>
                                                        <Feed.Label icon='newspaper'/>
                                                        <Feed.Content>
                                                            <Feed.Summary>
                                                                <a href={newsRow.news_url}>{newsRow.title}</a>
                                                            </Feed.Summary>
                                                            <Feed.Meta>
                                                                <Feed.Like>
                                                                    {newsRow.author}
                                                                    <Feed.Date>
                                                                        <TimeAgo date={newsRow.pub_date}/>
                                                                    </Feed.Date>
                                                                </Feed.Like>
                                                            </Feed.Meta>
                                                        </Feed.Content>
                                                    </Feed.Event>
                                                </Feed>)
                                        })
                                    }
                                </Card.Content>
                            </Card>)
                        })
                    }
                </Card.Group>
            </div>
        )
    }
}

export default KeywordCard
