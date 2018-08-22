#!/bin/bash

watch -n 10 scrapy crawl stockprice -a config=kdhc.settings.json
