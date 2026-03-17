#!/bin/bash

echo "🌟 HELIOS - Spatial Web Browser"
echo "================================"
echo ""
echo "Starting local server..."
echo ""

# Start Python HTTP server
python3 -m http.server 8080 &
SERVER_PID=$!

echo "✅ Server running (PID: $SERVER_PID)"
echo ""
echo "🌐 Open in your browser:"
echo ""
echo "   👉 http://localhost:8080/index-standalone.html"
echo ""
echo "🎤 Voice Commands:"
echo "   - 'Open YouTube'"
echo "   - 'Open Google'"
echo "   - 'Search for AI'"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Wait for interrupt
trap "kill $SERVER_PID; echo ''; echo '✅ Server stopped'; exit 0" INT
wait $SERVER_PID
