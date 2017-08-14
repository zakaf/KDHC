import React from 'react'
import { Card, Icon } from 'semantic-ui-react'

const items = [
      {
              header: 'Project Report - April',
              description: 'Leverage agile frameworks to provide a robust synopsis for high level overviews.',
              meta: 'ROI: 30%',
      },
      {
              header: 'Project Report - May',
              description: 'Bring to the table win-win survival strategies to ensure proactive domination.',
              meta: 'ROI: 34%',
      },
      {
              header: 'Project Report - June',
              description: 'Capitalise on low hanging fruit to identify a ballpark value added activity to beta test.',
              meta: 'ROI: 27%',
      },
]

const NewsCard = () => (
    <div>
        <Card.Group items={items} />
        <Card href='http://www.yonhapnewstv.co.kr/MYH20170118018900038/?did=1825m'>
            <Card.Content header="'운명의 날' 삼성 긴장 최고조…이재용 구속여부 '촉각'" />
            <Card.Meta content="연합뉴스TV" />
            <Card.Content description="SK와 롯데 등 이번 최순실 게이트에 연루된 기업들 역시 이 부                                회장의 신병 처리 여부에 촉각을 곤두세웠습니다. 김종성 기자가 보도합니다. [기자] 삼성그룹의 구심점인                                 이재용 부회장이 구속 위기에 몰리자 이른 아침부터..." />
            <Card.Content extra>
                <Icon name='newspaper' />
                박근혜
            </Card.Content>
        </Card>
    </div>
)

export default NewsCard
