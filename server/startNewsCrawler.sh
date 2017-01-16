#!/bin/bash

watch -n 10 scrapy crawl news -a config=kdhc.settings.json
