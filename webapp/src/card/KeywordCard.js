import React from 'react';
import {NavLink} from 'react-router-dom'
import {Card, Divider, Feed, Segment} from 'semantic-ui-react';
import TimeAgo from 'react-timeago';
import 'semantic-ui-css/semantic.min.css';
import '../css/Card.css';
import '../css/Feed.css';
import '../css/Divider.css';
import NoKeywordMessage from "../helper/NoKeywordMessage";
import config from '../config/config';

export class KeywordCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            keyword: null,
            intervalId: null,
            isFetching: null,
            isLoaded: false,
        };
        this.loadData = this.loadData.bind(this);
    }

    loadData() {
        this.setState({isFetching: true});

        let path = this.props.sub === '' ? "/keywords/" : "/userKeywords/";

        if (this.props.urlId)
            path = "/keyword/" + this.props.urlId;

        fetch(config.serverUrl + path, {headers: {'Authorization': 'Bearer ' + this.props.idToken}})
            .then(response => response.json())
            .then(json => {
                if (json.status === 'success')
                    this.setState({
                        keyword: json.data,
                        isFetching: null,
                        isLoaded: true
                    });
            })
    }

    componentDidMount() {
        this.loadData();

        let intervalId = setInterval(this.loadData, config.refreshInterval);

        /* store intervalId in the state so it can be accessed later:*/
        this.setState({intervalId: intervalId});
    }

    componentWillUnmount() {
        /* use intervalId from the state to clear the interval*/
        clearInterval(this.state.intervalId);
    }

    render() {
        if (this.state.isLoaded === false)
            return null;
        else if (this.state.keyword.length === 0) {
            return <NoKeywordMessage/>;
        }

        const color = ['red', 'orange', 'yellow', 'olive', 'green', 'teal', 'blue', 'violet', 'purple', 'pink', 'brown', 'grey'];

        let prevColor = null;

        const numOfCardPerRow = this.props.urlId ? 1 : 3;

        return (
            <Segment basic loading={this.state.isFetching}>
                <Card.Group itemsPerRow={numOfCardPerRow} stackable>
                    {
                        this.state.keyword.map(function (row) {
                            let currColor = color[Math.floor(Math.random() * color.length)];

                            while (currColor === prevColor)
                                currColor = color[Math.floor(Math.random() * color.length)];

                            prevColor = currColor;

                            const url = numOfCardPerRow === 3 ? '/keyword/' + row.url_id : '/keyword';

                            return (
                                <Card key={row.keyword} color={currColor}>
                                    <Card.Content>
                                        <Card.Header>
                                            <NavLink to={url}>{row.keyword}</NavLink>
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
                                </Card>
                            )
                        })
                    }
                </Card.Group>
            </Segment>
        )
    }
}

export default KeywordCard
