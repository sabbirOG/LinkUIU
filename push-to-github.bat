@echo off
echo Setting up GitHub push for LinkUIU...
echo.

REM Check if remote already exists
git remote get-url origin >nul 2>&1
if %errorlevel% equ 0 (
    echo Remote already configured. Pushing to GitHub...
    git push -u origin main
    if %errorlevel% equ 0 (
        echo.
        echo ✅ Successfully pushed to GitHub!
        echo Repository is now available on GitHub.
    ) else (
        echo.
        echo ❌ Push failed. Please check your GitHub repository URL.
    )
) else (
    echo.
    echo Please provide your GitHub repository URL:
    echo Example: https://github.com/yourusername/LinkUIU.git
    echo.
    set /p REPO_URL="Enter GitHub repository URL: "
    
    if "%REPO_URL%"=="" (
        echo No URL provided. Exiting.
        pause
        exit /b 1
    )
    
    echo.
    echo Adding remote repository...
    git remote add origin %REPO_URL%
    
    echo Pushing to GitHub...
    git push -u origin main
    
    if %errorlevel% equ 0 (
        echo.
        echo ✅ Successfully pushed to GitHub!
        echo Repository is now available on GitHub.
    ) else (
        echo.
        echo ❌ Push failed. Please check your GitHub repository URL and try again.
    )
)

echo.
pause
