""" import Statement """
import json
from datetime import datetime
import pymysql
import scrapy
from pyfcm import FCMNotification
from ..dbconn import DBConn

class NewsSpider(scrapy.Spider):
    """ Spider for news crawler """

    name = "news"

    def __init__(self, config='', *args, **kwargs):
        super(NewsSpider, self).__init__(*args, **kwargs)
        self.dbconn = DBConn(config)

        # Loads up configurations from a config file
        with open(config, 'r') as cfg:
            settings = json.load(cfg)

        self.cts = {}

    def get_crawl_url(self):
        """ return list of urls to crawl (only the ones in client_crawl_ct) """

        conn = self.dbconn.get_conn()

        try:
            with conn.cursor() as cursor:
                # Read a single record
                sql = "SELECT `url_id`, `url`, `keyword`"
                sql += "FROM `crawl_url` "
                sql += "WHERE `url_id` IN (SELECT `url_id` FROM `client_crawl_ct`)"
                cursor.execute(sql)
                result = cursor.fetchall()
        except pymysql.Error as ex:
            self.logger.error(str(ex))
        finally:
            conn.close()
        return result

    def start_requests(self):
        """ run crawl on urls in database """

        for url in self.get_crawl_url():
            yield scrapy.Request(
                url=url['url'],
                callback=self.parse)

    def parse(self, response):
        """ parse and save news in the database """

        conn = self.dbconn.get_conn()

        # under the assumption that no article that hasn't been saved to db
        # will be in between old articles
        # so it commits new articles until duplicate article is found
        # When duplicate is found, raise integrity error
        
        try:
            for item in response.xpath('//item'):
                with conn.cursor() as cursor:
                    sql = "INSERT INTO `news`"
                    sql += "(`news_url`, `title`, `description`, `pub_date`, `author`, `category`) "
                    sql += "VALUES (%s, %s, %s, %s, %s, %s)"
                    cursor.execute(
                        sql, (
                            item.xpath('./link/text()').extract_first(),
                            item.xpath('./title/text()').extract_first(),
                            item.xpath('./description/text()').extract_first(),
                            datetime.strptime(
                                item.xpath(
                                    './pubDate/text()').extract_first()[:-6],
                                '%a, %d %b %Y %H:%M:%S'),
                            item.xpath('./author/text()').extract_first(),
                            item.xpath('./category/text()').extract_first(),))
                    conn.commit()
        except pymysql.IntegrityError as ex:
            self.logger.info("DUPLICATE ENTRY")
            self.logger.info(str(ex))
        except pymysql.Error as ex:
            self.logger.error(str(ex))
        finally:
            conn.close()
