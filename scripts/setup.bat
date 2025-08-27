@echo off
echo 🚀 Setting up Bella Boutique development environment...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Create environment file if it doesn't exist
if not exist .env (
    echo 🔧 Creating .env file from template...
    copy env.example .env
    echo ⚠️  Please update .env with your Supabase credentials
) else (
    echo ✅ .env file already exists
)

REM Build the project
echo 🔨 Building the project...
call npm run build

if %errorlevel% equ 0 (
    echo ✅ Build successful!
    echo.
    echo 🎉 Setup complete! Next steps:
    echo 1. Update .env with your Supabase credentials
    echo 2. Run 'npm run dev' to start development server
    echo 3. Open http://localhost:5173 in your browser
) else (
    echo ❌ Build failed. Please check the errors above.
    pause
    exit /b 1
)

pause 