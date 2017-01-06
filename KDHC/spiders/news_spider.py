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

    def __init__(self, config='', *args, **kwargs):
        super(NewsSpider, self).__init__(*args, **kwargs)
        with open(config, 'r') as f:
            settings = json.load(f)
            self.host = settings['mysql.host']
            self.user = settings['mysql.user']
            self.password = settings['mysql.password']
            self.db = settings['mysql.db']
            self.api_key = settings['fcm.api_key']

    def get_crawl_url(self):
        self.log(self.password)
        conn = pymysql.connect( host=self.host,
                                user=self.user,
                                password=self.password,
                                db=self.db,
                                charset='utf8',
                                cursorclass=pymysql.cursors.DictCursor)
    
        try:
            with conn.cursor() as cursor:
                # Read a single record
                sql = "SELECT `url_id`, `url`, `keyword`, `mod_dtime` FROM `crawl_url`"
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
        
        push_service = FCMNotification(api_key=self.api_key)
        registration_id = 'e-h1Nmafro0:APA91bHN2IZ6bd98dpgLvsNTdcTuq5UWOM3vMqaBn1y_Re0taQ4_TUhDw9gOKF0ny4KYsxM3BLOjtTureQ6Ns1Kc-e6ofV2sYkTuvDPyObw0ukWnQJgDosG1Ots2wo2S6SWZrIHeqT13'
        
        #under the assumption that no new article (that hasn't been saved to db) will be in between old articles
        #so it commits new articles until duplicate article is found. When duplicate is found, raise integrity error
        try:
            messages_to_be_sent = []
            for p in response.xpath('//item'):
                with conn.cursor() as cursor:
                    self.log(p.xpath('./pubDate/text()').extract_first())
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
                    messages_to_be_sent.append({'title' : p.xpath('./title/text()').extract_first(), 'body' : p.xpath('./description/text()').extract_first()})
            while(len(messages_to_be_sent) != 0):
                message = messages_to_be_sent.pop()
                result = push_service.notify_single_device(registration_id=registration_id, message_title=message['title'], message_body=message['body'])
                if (result['failure'] != 0):
                    self.logger.error(result)
        except pymysql.IntegrityError as e:
            self.logger.info("DUPLICATE ENTRY");
            self.logger.info(str(e))
        except Exception as e:
            self.logger.error(str(e))
        finally:
            conn.close()

