import React from 'react'
import {Card, Icon} from 'semantic-ui-react'

export class NewsCard extends React.Component {
    render() {
        if (!this.props.news) {
            return null;
        }
        return (
            <div>
                <Card.Group itemsPerRow="4" stackable>
                    {
                        this.props.news.map(function (row) {
                            return (<Card href={row.news_url}>
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
