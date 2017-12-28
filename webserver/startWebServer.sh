#!/bin/bash

today=`date '+%Y%m%d'`;

node routes/index.js > logs/$today.log 2>&1 &

