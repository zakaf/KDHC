import React from 'react';
import NewsCard from './NewsCard';
import KeywordCard from "./KeywordCard";

class Body extends React.Component {
    render() {
        let body = null;

        if (this.props.page === 'news')
            body = <NewsCard/>;
        else if (this.props.page === 'keyword')
            body = <KeywordCard/>;

        return body;
    }
}

export default Body;