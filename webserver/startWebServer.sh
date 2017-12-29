#!/bin/bash

today=`date '+%Y%m%d'`;

npm install

node routes/index.js > logs/$today.log 2>&1 &

