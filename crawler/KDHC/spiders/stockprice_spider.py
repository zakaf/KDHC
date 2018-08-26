""" import Statement """
from datetime import datetime
import json
import pymysql
import scrapy
from ..dbconn import Database

class StockpriceSpider(scrapy.Spider):
    """ Spider for Naver Stock Price """

    name = "stockprice"

    def __init__(self, config='', *args, **kwargs):
        super(StockpriceSpider, self).__init__(*args, **kwargs)
        self.dbconn = Database(config)

        # Loads up configurations from a config file
        with open(config, 'r') as cfg:
            settings = json.load(cfg)
            self.api_key = settings['fcm.api_key']

    def get_crawl_stock(self):
        """ return list of stocks to crawl """

        conn = self.dbconn.get_conn()

        try:
            with conn.cursor() as cursor:
                # Read a single record
                sql = "SELECT `stock_code`, `stock_name` "
                sql += "FROM `stock` "
                sql += "WHERE `stock_code` IN (SELECT `stock_code` FROM `stock_alert`)"
                cursor.execute(sql)
                result = cursor.fetchall()
        except pymysql.Error as ex:
            self.logger.error(str(ex))
        finally:
            conn.close()
        return result
    
    def get_alert_percentage(self, stock_code):
        """ return sets of client id and alert percentage """

        conn = self.dbconn.get_conn()

        try:
            with conn.cursor() as cursor:
                sql = "SELECT `client_id`, `percentage_change` "
                sql += "FROM `stock_alert` "
                sql += "WHERE `stock_code` = '%s'"
                cursor.execute(sql % stock_code)
                result = cursor.fetchall()
        except pymysql.Error as ex:
            self.logger.error(str(ex))
        finally:
            conn.close()
        return result

    def start_requests(self):
        """ run crawl on urls in database """

        curr_time = datetime.now().strftime('%Y%m%d%H%M%S')

        naver_stock_url_prefix = 'http://finance.naver.com/item/sise_time.nhn?'

        for stock in self.get_crawl_stock():
            yield scrapy.Request(
                #url=naver_stock_url_prefix+'code='+stock['stock_code']+'&thistime='+curr_time,
                url=naver_stock_url_prefix+'code='+stock['stock_code']+'&thistime=20170222091000',
                callback=self.parse,
                meta={'stock_code': stock['stock_code']})

    def parse(self, response):
        """ parse and send notification to registration ids registered on stock price ct """
        #alert in the following cases:
        #previous % change < alert % change < current % change or vice versa
        #abs(current % change) > abs(alert % change), if it's first stock price of the day

        stock_infos = []

        conn = self.dbconn.get_conn()

        try:
            expr = '//table[@class=\'type2\']/tr[@onmouseover=\'mouseOver(this)\']'
            stockdownimgurl = "http://imgstock.naver.com/images/images4/ico_down.gif"

            for stockinfo in response.xpath(expr):
                cols = stockinfo.xpath('./td/span/text()').extract()

                if len(cols) == 0:
                    break

                #add minus percentage is change/yesterday
                if stockinfo.xpath('./td/img/@src').extract_first() == stockdownimgurl:
                    cols[2] = '-' + cols[2].strip()

                stock_infos.append({
                    "stock_code" : response.meta['stock_code'],
                    "time" : datetime.strptime(
                        datetime.now().strftime('%Y%m%d')+cols[0].strip()+":00",
                        '%Y%m%d%H:%M:%S'),
                    "price" : int(cols[1].strip().replace(',', '')),
                    "change_from_yesterday" : int(cols[2].strip().replace(',', '')),
                    "selling_price" : int(cols[3].strip().replace(',', '')),
                    "buying_price" : int(cols[4].strip().replace(',', '')),
                    "volume" : int(cols[5].strip().replace(',', '')),
                    "change_in_volume" : int(cols[6].strip().replace(',', ''))
                })

                with conn.cursor() as cursor:
                    sql = "INSERT INTO `stock_price`"
                    sql += "(`stock_code`, `time`, `price`, `change_from_yesterday`, "
                    sql += "`selling_price`, `buying_price`, `volume`,"
                    sql += "`change_in_volume_from_last_time`) "
                    sql += "VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
                    cursor.execute(
                        sql, (
                            stock_infos[0]['stock_code'],
                            stock_infos[0]['time'],
                            stock_infos[0]['price'],
                            stock_infos[0]['change_from_yesterday'],
                            stock_infos[0]['selling_price'],
                            stock_infos[0]['buying_price'],
                            stock_infos[0]['volume'],
                            stock_infos[0]['change_in_volume'],))
                    conn.commit()
        except pymysql.IntegrityError as ex:
            self.logger.info("DUPLICATE ENTRY")
            self.logger.info(str(ex))
        except pymysql.Error as ex:
            self.logger.error(str(ex))
        finally:
            conn.close()

        #check if alert has already been made
        if len(stock_infos) == 1:
            pass #alert based on only one price
        elif len(stock_infos) > 1:
            prev_day_price = float(stock_infos[0]['price']-stock_infos[0]['change_from_yesterday'])
            change_percentage = float(stock_infos[0]['change_from_yesterday'] / prev_day_price)

            prev_change_precentage = float(stock_infos[1]['change_from_yesterday'] / prev_day_price)

            #get user's wished alert percentage
            #
