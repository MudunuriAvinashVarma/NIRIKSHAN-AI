@echo off
title NIRIKSHAN AI Launcher

echo ======================================
echo       STARTING NIRIKSHAN AI
echo ======================================

cd /d "C:\Users\avina\OneDrive\Documents\AI-Projects\NIRIKSHAN-AI"

echo Starting FastAPI Backend...
start "NIRIKSHAN Backend" powershell -NoExit -Command "Set-Location 'C:\Users\avina\OneDrive\Documents\AI-Projects\NIRIKSHAN-AI'; .\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8001"

timeout /t 5 /nobreak >nul

echo Starting Next.js Frontend...
start "NIRIKSHAN Frontend" powershell -NoExit -Command "Set-Location 'C:\Users\avina\OneDrive\Documents\AI-Projects\NIRIKSHAN-AI\frontend'; npm run dev"

timeout /t 10 /nobreak >nul

echo Opening NIRIKSHAN AI...
start "" "http://localhost:3000"

echo ======================================
echo       NIRIKSHAN AI STARTED
echo ======================================