#!/bin/bash

today=`date '+%Y%m%d'`;

npm install --production

npm start > logs/$today.log 2>&1 &

