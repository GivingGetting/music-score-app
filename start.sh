#!/usr/bin/env bash
# 启动前后端开发服务器

echo "🎵 启动音乐 Web App..."

# Start backend
echo "▶ 启动后端 (FastAPI)..."
cd backend
export PATH="$PATH:/Users/donnaliu/Library/Python/3.9/bin"
pip3 install -r requirements.txt -q
python3 -m uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
sleep 3

# Start frontend
echo "▶ 启动前端 (Vite)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ 服务已启动:"
echo "   前端: http://localhost:5173"
echo "   后端: http://localhost:8000"
echo "   API文档: http://localhost:8000/docs"
echo ""
echo "按 Ctrl+C 停止所有服务"

# Wait and cleanup
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
