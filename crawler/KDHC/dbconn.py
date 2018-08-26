""" import statements """
import json
import pymysql

class Database(object):
    """ DB Connection helper class for KDHC """

    def __init__(self, config_file_name):
        # Loads up configurations from a config file
        with open(config_file_name, 'r') as cfg:
            settings = json.load(cfg)
            self.host = settings['mysql.host']
            self.user = settings['mysql.user']
            self.password = settings['mysql.password']
            self.dbname = settings['mysql.db']

    def get_conn(self):
        """ get database connection object"""

        return pymysql.connect(
            host=self.host,
            user=self.user,
            password=self.password,
            db=self.dbname,
            charset='utf8',
            cursorclass=pymysql.cursors.DictCursor)
