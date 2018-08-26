""" import statements """
import json
import redis

class Redis(object) :
    """ Redis Connection helper class for KDHC """
    def __init__(self, config_file_name):
            # Loads up configurations from a config file
            with open(config_file_name, 'r') as cfg:
                settings = json.load(cfg)
                self.host = settings['redis.host']
                self.port = settings['redis.port']

    def get_conn(self):
        """ get redis connection object"""

        return redis.StrictRedis(host=self.host, port=self.port, db=0)
