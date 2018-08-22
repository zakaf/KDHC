from scrapy.cmdline import execute

execute([
    'scrapy', 'crawl', 'stockprice',
    '-a', 'config=kdhc.settings.json'])
