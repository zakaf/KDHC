import scrapy
import pymysql
import json

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
            self.log(str(e))
        finally:
            conn.close()
        return result

    def start_requests(self):
        for url in self.get_crawl_url():
            yield scrapy.Request(url=url['url'], callback=self.parse)

    def parse(self, response):
        conn = pymysql.connect( host=self.host,
                                user=self.user,
                                password=self.password,
                                db=self.db,
                                charset='utf8mb4',
                                cursorclass=pymysql.cursors.DictCursor)
        
        push_service = FCMNotification(api_key=self.api_key)
        registration_id = 'emGlTpbG6D8:APA91bENFD8OJ62V7S3Ho_PTlOMJDAZVeSD1Y8ztrC2-D0bJcl3Ljh-2kqmZslF3Mo1dzYZwH5wL3ZBf1Wq1phfVNqbQfMmF5on4-bWUqXSSCMTfkeh2b9edIMs6YTxz6mZ8T_3qedUK'
        
        #under the assumption that no new article (that hasn't been saved to db) will be in between old articles
        #so it commits new articles until duplicate article is found. When duplicate is found, raise integrity error
        try:
            for p in response.xpath('//item'):
                with conn.cursor() as cursor:
                    sql = "INSERT INTO `news` (`news_url`, `crawled_url`, `title`, `description`, `pub_date`, `author`, `category`) VALUES (%s, %s, %s, %s, now(), %s, %s)"
                    cursor.execute(sql, (p.xpath('./link/text()').extract_first(), 
                                        response.request.url, 
                                        p.xpath('./title/text()').extract_first(), 
                                        p.xpath('./description/text()').extract_first(), 
                                        p.xpath('./author/text()').extract_first(), 
                                        p.xpath('./category/text()').extract_first(),))
                    conn.commit()
                    #alert
                    message_title = p.xpath('./title/text()').extract_first()
                    message_body = p.xpath('./description/text()').extract_first()
                    result = push_service.notify_single_device(registration_id=registration_id, message_title=message_title, message_body=message_body)
                    self.log(result)
        except pymysql.IntegrityError as e:
            self.log("DUPLICATE ENTRY");
            self.log(str(e))
        except Exception as e:
            self.log(str(e))
        finally:
            conn.close()

