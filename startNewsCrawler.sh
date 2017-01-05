#!/bin/bash

export LOG_HOME=./logs/

current_time=$(date "+%Y.%m.%d-%H.%M.%S")

watch -n 10 scrapy crawl news -a config=kdhc.settings.json | tee $LOG_HOME/newscrawler-$current_time.log
