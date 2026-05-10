#!/bin/zsh
cd "$(dirname "$0")"
python3 server.py &
sleep 1
open "http://localhost:4173/index.html"
wait
