@echo off
echo Starting Mock Server and Dev Server...

REM 在新的窗口中启动 mock server
start "Mock Server" cmd /k "npm run mock"

REM 在新的窗口中启动 dev server
start "Dev Server" cmd /k "npm run dev"

echo Both processes have been started in new windows.
