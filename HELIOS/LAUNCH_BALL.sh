#!/bin/bash

echo "🎮 HELIOS - Interactive Ball"
echo "============================"
echo ""
echo "Starting local server..."

# Start Python HTTP server
python3 -m http.server 8080 &
SERVER_PID=$!

sleep 1

echo ""
echo "✅ Server running!"
echo ""
echo "🌐 Open this URL in your browser:"
echo ""
echo "   👉 http://localhost:8080/ball.html"
echo ""
echo "🎯 What you can do:"
echo "   • Point with 1 finger → Move cursor"
echo "   • Pinch (thumb+index) → Pick up ball"
echo "   • Release pinch → Drop ball (gravity!)"
echo "   • Use 2 hands → Scale ball bigger/smaller"
echo ""
echo "📹 Camera will activate - grant permission"
echo ""
echo "Press Ctrl+C to stop"
echo ""

trap "kill $SERVER_PID 2>/dev/null; echo ''; echo '✅ Server stopped'; exit 0" INT
wait $SERVER_PID
