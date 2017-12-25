import React from 'react';
import {Card, Icon, Segment} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import './css/Card.css';

export class NewsCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            news: null,
            intervalId: null,
            isFetching: null
        };
        this.loadData = this.loadData.bind(this);
    }

    loadData() {
        let config = require('./config/config.js');

        this.setState({isFetching: true});

        fetch(config.config.serverUrl + "/news/" + this.props.sub,
            {headers: {'Authorization': 'Bearer ' + this.props.idToken}})
            .then(response => response.json())
            .then(json => {
                this.setState({
                    news: json,
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
        if (!this.state.news) {
            return null;
        }

        return (
            <Segment basic loading={this.state.isFetching}>
                <Card.Group itemsPerRow="4" stackable>
                    {
                        this.state.news.map(function (row) {
                            return (<Card href={row.news_url} key={row.news_url}>
                                <Card.Content header={row.title}/>
                                <Card.Meta content={row.author}/>
                                <Card.Content description={row.description}/>
                                <Card.Content extra>
                                    <Icon name='newspaper'/>
                                    {row.keyword}
                                </Card.Content>
                            </Card>)
                        })
                    }
                </Card.Group>
            </Segment>
        )
    }
}

export default NewsCard
