#!/bin/bash

kill $(ps aux | grep 3000 | grep '[n]ode' | awk '{print $2}')
