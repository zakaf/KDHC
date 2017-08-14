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
            self.api_key = settings['fcm.api_key']

        self.cts = {}

        # retrieve map of url_id and list of registration ids
        for connection in self.get_client_crawl_ct():
            if self.cts.has_key(connection['url_id']):
                self.cts[connection['url_id']].append(
                    connection['registration_id'])
            else:
                self.cts[connection['url_id']] = [
                    connection['registration_id']]

    def get_crawl_url(self):
        """ return list of urls to crawl """

        conn = self.dbconn.get_conn()

        try:
            with conn.cursor() as cursor:
                # Read a single record
                sql = "SELECT `url_id`, `url`, `keyword`, `mod_dtime` "
                sql += "FROM `crawl_url` "
                sql += "WHERE `url_id` IN (SELECT `url_id` FROM `client_crawl_ct`)"
                cursor.execute(sql)
                result = cursor.fetchall()
        except pymysql.Error as ex:
            self.logger.error(str(ex))
        finally:
            conn.close()
        return result

    def get_client_crawl_ct(self):
        """ return list of client crawl connection map """

        conn = self.dbconn.get_conn()

        try:
            with conn.cursor() as cursor:
                # Read a single record
                sql = "SELECT `url_id`, `registration_id` "
                sql += "FROM `client_crawl_ct`, `client`"
                sql += "WHERE `client_crawl_ct`.`client_id` = `client`.`client_id`"
                sql += "AND `url_id` IN (SELECT `url_id` FROM `crawl_url`)"
                sql += "ORDER BY `url_id` ASC"
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
                callback=self.parse,
                meta={'url_id': url['url_id']})

    def parse(self, response):
        """ parse and send notification to registration ids registered on client_crawl_ct """

        conn = self.dbconn.get_conn()

        # under the assumption that no article that hasn't been saved to db
        # will be in between old articles
        # so it commits new articles until duplicate article is found
        # When duplicate is found, raise integrity error
        messages_to_be_sent = []
        try:
            for item in response.xpath('//item'):
                with conn.cursor() as cursor:
                    sql = "INSERT INTO `news`"
                    sql += "(`news_url`, `crawled_url_id`, `title`, `description`, "
                    sql += "`pub_date`, `author`, `category`) "
                    sql += "VALUES (%s, %s, %s, %s, %s, %s, %s)"
                    cursor.execute(
                        sql, (
                            item.xpath('./link/text()').extract_first(),
                            response.meta['url_id'],
                            item.xpath('./title/text()').extract_first(),
                            item.xpath('./description/text()').extract_first(),
                            datetime.strptime(
                                item.xpath(
                                    './pubDate/text()').extract_first()[:-6],
                                '%a, %d %b %Y %H:%M:%S'),
                            item.xpath('./author/text()').extract_first(),
                            item.xpath('./category/text()').extract_first(),))
                    conn.commit()
                    # save messages to be sent
                    messages_to_be_sent.append({
                        'title': item.xpath('./title/text()').extract_first(),
                        'body': item.xpath('./description/text()').extract_first(),
                        'url_id': response.meta['url_id']
                    })
        except pymysql.IntegrityError as ex:
            self.logger.info("DUPLICATE ENTRY")
            self.logger.info(str(ex))
        except pymysql.Error as ex:
            self.logger.error(str(ex))
        finally:
            conn.close()

"""
        push_service = FCMNotification(api_key=self.api_key)
        while messages_to_be_sent:
            message = messages_to_be_sent.pop()
            results = push_service.notify_multiple_devices(
                registration_ids=self.cts[message['url_id']],
                message_title=message['title'],
                message_body=message['body'])
            for result in results:
                if result['failure'] != 0:
                    self.logger.error(result)
"""
