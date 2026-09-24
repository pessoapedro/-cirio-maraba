@echo off
echo TEST_RUN_START
where python >nul 2>&1
echo after_where %ERRORLEVEL%
pause
