import React from 'react';
import {Card, Divider, Feed, Segment} from 'semantic-ui-react';
import TimeAgo from 'react-timeago';
import 'semantic-ui-css/semantic.min.css';
import './css/Card.css';
import './css/Feed.css';
import './css/Divider.css';

export class KeywordCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            keyword: null,
            intervalId: null,
            isFetching: null
        };
        this.loadData = this.loadData.bind(this);
    }

    loadData() {
        let config = require('./config/config.js');

        this.setState({isFetching: true});

        fetch(config.config.serverUrl + "/keywords/" + this.props.sub,
            {headers: {'Authorization': 'Bearer ' + this.props.idToken}})
            .then(response => response.json())
            .then(json => {
                this.setState({
                    keyword: json,
                    isFetching: null
                })
            })
    }

    componentDidMount() {
        this.loadData();

        let config = require('./config/config.js');

        var intervalId = setInterval(this.loadData, config.config.refreshInterval);

        /* store intervalId in the state so it can be accessed later:*/
        this.setState({intervalId: intervalId});
    }

    componentWillUnmount() {
        /* use intervalId from the state to clear the interval*/
        clearInterval(this.state.intervalId);
    }

    render() {
        if (!this.state.keyword) {
            return null;
        }

        return (
            <Segment basic loading={this.state.isFetching}>
                <Card.Group itemsPerRow="3" stackable>
                    {
                        this.state.keyword.map(function (row) {
                            return (<Card key={row.keyword}>
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
            </Segment>
        )
    }
}

export default KeywordCard
