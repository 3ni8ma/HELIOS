#!/bin/bash

echo "🚀 Starting HELIOS..."
echo ""
echo "📍 Opening browser at http://localhost:8080"
echo ""

# Check if server is already running
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Server already running"
else
    echo "🔧 Starting local server..."
    python3 -m http.server 8080 &
    sleep 2
fi

# Open browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open http://localhost:8080
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open http://localhost:8080
else
    # Windows
    start http://localhost:8080
fi

echo ""
echo "✨ HELIOS is ready!"
echo ""
echo "📝 Quick Tips:"
echo "   • Grant camera and microphone permissions"
echo "   • Say 'Open YouTube' to create your first window"
echo "   • Point your hand and pinch to interact"
echo "   • Press Ctrl+Space for tab overview"
echo ""
echo "📚 Documentation: README.md"
echo "🎬 Demo Guide: DEMO.md"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Keep script running
wait
