import scrapy
import pymysql
import json

from datetime import datetime
from pyfcm import FCMNotification

class NewsSpider(scrapy.Spider):
    name = "news"
    host = ''
    user = ''
    password = ''
    db = ''
    api_key = ''
    cts = {}

    def __init__(self, config='', *args, **kwargs):
        super(NewsSpider, self).__init__(*args, **kwargs)
        with open(config, 'r') as f:
            settings = json.load(f)
            self.host = settings['mysql.host']
            self.user = settings['mysql.user']
            self.password = settings['mysql.password']
            self.db = settings['mysql.db']
            self.api_key = settings['fcm.api_key']
        for ct in self.get_client_crawl_ct():
            if self.cts.has_key(ct['url_id']):
                self.cts[ct['url_id']].append(ct['registration_id'])
            else:
                self.cts[ct['url_id']] = [ct['registration_id']]

    def get_crawl_url(self):
        conn = pymysql.connect( host=self.host,
                                user=self.user,
                                password=self.password,
                                db=self.db,
                                charset='utf8',
                                cursorclass=pymysql.cursors.DictCursor)
    
        try:
            with conn.cursor() as cursor:
                # Read a single record
                sql = "SELECT `url_id`, `url`, `keyword`, `mod_dtime` FROM `crawl_url` where `url_id` in (select `url_id` from `client_crawl_ct`)"
                cursor.execute(sql)
                result = cursor.fetchall()
        except Exception as e:
            self.logger.error(str(e))
        finally:
            conn.close()
        return result

    def get_client_crawl_ct(self):
        conn = pymysql.connect( host=self.host,
                                user=self.user,
                                password=self.password,
                                db=self.db,
                                charset='utf8',
                                cursorclass=pymysql.cursors.DictCursor)
    
        try:
            with conn.cursor() as cursor:
                # Read a single record
                sql = "SELECT `url_id`, `registration_id` FROM `client_crawl_ct`, `client` WHERE `client_crawl_ct`.`client_id` = `client`.`client_id` and `url_id` in (select `url_id` from `crawl_url`) order by `url_id` asc"
                cursor.execute(sql)
                result = cursor.fetchall()
        except Exception as e:
            self.logger.error(str(e))
        finally:
            conn.close()
        return result

    def start_requests(self):
        for url in self.get_crawl_url():
            yield scrapy.Request(url=url['url'], callback=self.parse, meta={'url_id': url['url_id']})

    def parse(self, response):
        conn = pymysql.connect( host=self.host,
                                user=self.user,
                                password=self.password,
                                db=self.db,
                                charset='utf8mb4',
                                cursorclass=pymysql.cursors.DictCursor)
        
        #under the assumption that no new article (that hasn't been saved to db) will be in between old articles
        #so it commits new articles until duplicate article is found. When duplicate is found, raise integrity error
        messages_to_be_sent = []
        try:
            for p in response.xpath('//item'):
                with conn.cursor() as cursor:
                    sql = "INSERT INTO `news` (`news_url`, `crawled_url_id`, `title`, `description`, `pub_date`, `author`, `category`) " 
                    sql += "VALUES (%s, %s, %s, %s, %s, %s, %s)"
                    cursor.execute(sql, (p.xpath('./link/text()').extract_first(), 
                                        response.meta['url_id'], 
                                        p.xpath('./title/text()').extract_first(), 
                                        p.xpath('./description/text()').extract_first(), 
                                        datetime.strptime(p.xpath('./pubDate/text()').extract_first()[:-6],'%a, %d %b %Y %H:%M:%S'),
                                        p.xpath('./author/text()').extract_first(), 
                                        p.xpath('./category/text()').extract_first(),))
                    conn.commit()
                    #save messages to be sent
                    messages_to_be_sent.append({'title' : p.xpath('./title/text()').extract_first(), 'body' : p.xpath('./description/text()').extract_first(), 'url_id' : response.meta['url_id']})
        except pymysql.IntegrityError as e:
            self.logger.info("DUPLICATE ENTRY");
            self.logger.info(str(e))
        except Exception as e:
            self.logger.error(str(e))
        finally:
            conn.close()
        
        push_service = FCMNotification(api_key=self.api_key)
        while messages_to_be_sent:
            message = messages_to_be_sent.pop()
            results = push_service.notify_multiple_devices(registration_ids=self.cts[message['url_id']], message_title=message['title'], message_body=message['body'])
            for result in results:
                if (result['failure'] != 0):
                    self.logger.error(result)

