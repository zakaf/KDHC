#!/bin/bash

today=`date '+%Y%m%d'`;

npm install

export NODE_ENV=production&&node routes/index.js > logs/$today.log 2>&1 &

