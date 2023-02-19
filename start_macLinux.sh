#!/bin/bash
rm $HISTFILE
until npm start $1 $2 $3; do
    echo "Bot closed, restarting..." >&2
    sleep 1
done