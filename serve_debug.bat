@echo off
echo DEBUG_START
echo CHECK_WWW
IF NOT EXIST "www" (
  echo MISSING_WWW
) ELSE (
  echo WWW_OK
)
echo AFTER_WWW
where firebase >nul 2>&1
echo AFTER_WHERE_FIREBASE %ERRORLEVEL%
where npx >nul 2>&1
echo AFTER_WHERE_NPX %ERRORLEVEL%
echo DEBUG_END
pause
