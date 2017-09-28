import React from 'react';
import {Card, Icon} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import './css/Card.css';

export class NewsCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            news: null
        };
        this.loadData = this.loadData.bind(this);
    }

    loadData() {
        let config = require('./config/config.js');

        fetch(config.config.serverUrl + "/news")
            .then(response => response.json())
            .then(json => {
                this.setState({
                    news: json
                })
            })
    }

    componentDidMount() {
        this.loadData();
    }

    render() {
        if (!this.state.news) {
            return null;
        }

        return (
            <div>
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
            </div>
        )
    }
}

export default NewsCard
