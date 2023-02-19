#!/bin/bash
rm ~/.zsh_history
echo "History cleaned!"
until npm start $1 $2 $3; do
    echo "Bot closed, restarting..." >&2
    sleep 1
done