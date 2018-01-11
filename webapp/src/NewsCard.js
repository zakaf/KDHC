import React from 'react';
import {Card, Icon, Segment, Visibility} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import './css/Card.css';

export class NewsCard extends React.Component {
    handleUpdate = (e, {calculations}) => {
        if (calculations.onScreen && calculations.bottomVisible && calculations.direction === 'down')
            this.loadNextPage();
    };

    constructor(props) {
        super(props);
        this.state = {
            news: [],
            intervalId: null,
            isFetching: null,
            hasMoreItems: true,
            nextPageNum: 1
        };
        this.loadNextPage = this.loadNextPage.bind(this);
        this.refreshData = this.refreshData.bind(this);
    }

    loadNextPage() {
        this.loadData(false);
    }

    refreshData() {
        this.loadData(true);
    }

    loadData(isRefresh) {
        if (isRefresh)
            this.setState({
                nextPageNum: this.state.nextPageNum - 1
            });

        let config = require('./config/config.js');

        this.setState({isFetching: true});

        fetch(config.config.serverUrl + "/news/" + this.state.nextPageNum + "/" + this.props.sub,
            {headers: {'Authorization': 'Bearer ' + this.props.idToken}})
            .then(response => response.json())
            .then(json => {
                //이렇게 해놓으면 마지막 장에 페이지당 최대 데이터 갯수만큼 안와도 동일하게 행동하므로 nextPageNum이 꼬임.
                //새로고침 주기당 뉴스가 1개씩 추가된다는 가정아래에 실제로 9페이지에 포함될 내용인 뉴스가 1개씩 추가되면
                //nextPageNum은 계속 1씩 증가할 것이다. 새로고침 주기 사이에 갑자기 페이지당 최대 데이터 갯수만큼 뉴스가 추가되지 않는 이상
                //사용자가 차이를 느끼지는 못한다.
                if (json.length !== this.state.news.length || isRefresh)
                    this.setState({
                        nextPageNum: this.state.nextPageNum + 1
                    });

                this.setState({
                    news: json,
                    isFetching: null
                });

                this.endRefresh();
                this.startRefresh();
            })
    }

    startRefresh() {
        let config = require('./config/config.js');

        const intervalId = setTimeout(this.refreshData, config.config.refreshInterval);

        /* store intervalId in the state so it can be accessed later:*/
        this.setState({intervalId: intervalId});
    }

    endRefresh() {
        clearInterval(this.state.intervalId);
    }

    componentDidMount() {
        this.loadNextPage();
        this.startRefresh();
    }

    componentWillUnmount() {
        /* use intervalId from the state to clear the interval*/
        this.endRefresh();
    }

    render() {
        let items = [];

        const color = ['red', 'orange', 'yellow', 'olive', 'green', 'teal', 'blue', 'violet', 'purple', 'pink', 'brown', 'grey'];

        this.state.news.forEach((row) => {
            items.push(
                <Card href={row.news_url} key={row.news_url}
                      color={color[row.title.charCodeAt(row.title.length - 1) % (color.length + 1)]}>
                    <Card.Content header={row.title}/>
                    <Card.Meta content={row.author}/>
                    <Card.Content description={row.description}/>
                    <Card.Content extra>
                        <Icon name='newspaper'/>
                        {row.keyword}
                    </Card.Content>
                </Card>
            );
        });

        return (
            <Visibility onUpdate={this.handleUpdate}>
                <Segment basic loading={this.state.isFetching}>
                    <Card.Group itemsPerRow="4" stackable>
                        {items}
                    </Card.Group>
                </Segment>
            </Visibility>
        )
    }
}

export default NewsCard
