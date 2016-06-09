#!/bin/bash

BRDHOST=10.170.141.43

scp -r brd_app/ root@$BRDHOST:.
ssh root@$BRDHOST "ps | grep node | grep server | awk '{print $1}' | xargs kill -9"
ssh root@$BRDHOST "cd /root/brd_app && node main"