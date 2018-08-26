""" import statements """
from ..dbconn import Database
from datetime import datetime
import json
import pymysql
import scrapy
from ..redisconn import Redis

class NewsSpider(scrapy.Spider):
    """ Spider for news crawler """

    name = "news"

    def __init__(self, config='', *args, **kwargs):
        super(NewsSpider, self).__init__(*args, **kwargs)
        self.database = Database(config)
        self.cache = Redis(config).get_conn()

    def start_requests(self):
        """ run crawl on urls in database """

        for url in self.get_crawl_url():
            yield scrapy.Request(
                url=url['url'],
                callback=self.parse)


    def get_crawl_url(self):
        """ return list of urls to crawl (only the ones in client_crawl_ct) """

        conn = self.database.get_conn()

        try:
            with conn.cursor() as cursor:
                # Read a single record
                sql = "SELECT distinct `url`"
                sql += "FROM `crawl_url` "
                sql += "WHERE `url_id` IN (SELECT `url_id` FROM `client_crawl_ct`)"
                cursor.execute(sql)
                result = cursor.fetchall()
        except pymysql.Error as ex:
            self.logger.error(str(ex))
        finally:
            conn.close()
        return result

    def parse(self, response):
        """ parse and save news in the database """

        # under the assumption that no article that hasn't been saved to db
        # will be in between old articles
        # so it commits new articles until duplicate article is found
        # When duplicate is found, raise integrity error

        cacheInvalidated = False

        for item in response.xpath('//item'):
            news_url = item.xpath('./link/text()').extract_first()
            title = item.xpath('./title/text()').extract_first(),
            description = item.xpath('./description/text()').extract_first()
            pub_date = datetime.strptime(item.xpath('./pubDate/text()').extract_first()[:-6],'%a, %d %b %Y %H:%M:%S')
            author = item.xpath('./author/text()').extract_first()
            category = item.xpath('./category/text()').extract_first()

            if (self.insert_news(news_url, title, description, pub_date, author, category, response.url) != 0):
                break
            elif (cacheInvalidated == False):
                # invalidate keyword card and news card cache if new news has been added to the database
                # invalidate keyword card cache
                self.invalidateCacheForUrl(response.url)

                # invalidate news card cache for all the pages
                # invalidate user news card cache if user owns the following keyword
                
                cacheInvalidated = True

    def insert_news(self, news_url, title, description, pub_date, author, category, crawl_url):
        """ insert news """

        conn = self.database.get_conn()

        try:
            with conn.cursor() as cursor:
                sql = "INSERT INTO `news`"
                sql += "(`news_url`, `title`, `description`, `pub_date`, `author`, `category`) "
                sql += "VALUES (%s, %s, %s, %s, %s, %s)"
                cursor.execute(
                    sql, 
                    (
                        news_url,
                        title,
                        description,
                        pub_date,
                        author,
                        category
                    )
                )
                conn.commit()

        except pymysql.IntegrityError as ex:
            self.logger.info("Duplicate news : " + str(ex))
        except pymysql.Error as ex:
            self.logger.error(str(ex))
            return 1
        finally:
            conn.close()
        
        return self.insert_crawl_ct(crawl_url, news_url)
        

    def insert_crawl_ct(self, crawl_url, news_url):
        """ insert news_crawl_ct for correpsonding crawl_url and news_url """
        
        conn = self.database.get_conn()

        try:
            with conn.cursor() as cursor:
                sql = "INSERT INTO `news_crawl_ct` (`url_id`,`news_url`)"
                sql += "SELECT `url_id`, %s"
                sql += " FROM crawl_url WHERE url = %s"

                cursor.execute(sql, (news_url, crawl_url))

                conn.commit()
        except pymysql.IntegrityError as ex:
            self.logger.info("Duplicate news_crawl_ct : " + str(ex))
            return 1
        except pymysql.Error as ex:
            self.logger.error(str(ex))
            return 1
        finally:
            conn.close()

        return 0
    
    def invalidateCacheForUrl(self, crawl_url):
        """ invalidate cache for keywords with given crawl_url """

        conn = self.database.get_conn()

        try:
            with conn.cursor() as cursor:
                # get url ids of the given url
                sql = "SELECT `url_id`"
                sql += "FROM `crawl_url` "
                sql += "WHERE `url` = %s"
                cursor.execute(sql, (crawl_url))
                result = cursor.fetchall()
        except pymysql.Error as ex:
            self.logger.error(str(ex))
        finally:
            conn.close()
        
        for url in result:
            self.cache.delete("keyword:"+`url['url_id']`)