#!/bin/bash
cd /home/kavia/workspace/code-generation/collaborative-task-board-21175-21184/task_management_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

