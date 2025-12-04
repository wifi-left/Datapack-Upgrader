@echo off
chcp 65001
echo WARNING: You should install Node.JS first to use the program.
call npm install
call npm run translate_cli
pause