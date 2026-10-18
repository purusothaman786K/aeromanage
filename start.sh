#!/bin/bash
cd "$(dirname "$0")"
lsof -ti:5001 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
trap 'kill 0' INT TERM
(cd server && npm run dev) &
(cd client && npm run dev) &
sleep 7
open http://localhost:5173
wait
