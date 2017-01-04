import scrapy


class NewsSpider(scrapy.Spider):
    name = "news"

    start_urls = [
            'http://newssearch.naver.com/search.naver?where=rss&query=%EA%B3%B5%EA%B5%B0&field=0&nx_search_query=&nx_and_query=&nx_sub_query=&nx_search_hlquery=',
        ]

    def parse(self, response):
        f = open('log.log','w')
        for p in response.xpath('//item'):
            f.write(p.xpath('./title/text()').extract_first().encode('utf8'))
            f.write('\n')
            f.write(p.xpath('./description/text()').extract_first().encode('utf8'))
            f.write('\n')
        f.close()

