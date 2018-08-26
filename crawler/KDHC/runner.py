from scrapy.cmdline import execute

execute([
    'scrapy', 'crawl', 'news',
    '-a', 'config=kdhc.settings.json'])
