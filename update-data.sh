#!/bin/bash
# Script to fetch real data and update the dashboard

SCRIPT_DIR="/home/ubuntu/.openclaw/workspace/mission-control"
DATA_DIR="$SCRIPT_DIR/data"

mkdir -p "$DATA_DIR"

# Fetch Gmail - unread count
python3 /home/ubuntu/.openclaw/scripts/gmail.py unread > "$DATA_DIR/gmail.json" 2>/dev/null

# Fetch Gmail - list
python3 /home/ubuntu/.openclaw/scripts/gmail.py list 10 > "$DATA_DIR/gmail-list.json" 2>/dev/null

# Fetch Jira - my tickets
python3 /home/ubuntu/.openclaw/scripts/jira.py mine > "$DATA_DIR/jira.json" 2>/dev/null

# Fetch Calendar - today
python3 /home/ubuntu/.openclaw/scripts/calendar.py today > "$DATA_DIR/calendar.json" 2>/dev/null

# Fetch Deploys - list
python3 /home/ubuntu/.openclaw/scripts/vercel.py list > "$DATA_DIR/deploys.json" 2>/dev/null

echo "Data updated at $(date)"
ls -la "$DATA_DIR/"