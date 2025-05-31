from app import create_app
from app.websocket.chat_handler import socketio

app = create_app()

if __name__ == "__main__":
    print("\n=== Server Starting ===")
    print("WebSocket Server running at:")
    print("  - WebSocket URL: ws://localhost:5001")
    print("  - HTTP URL: http://localhost:5001")
    print("  - Socket.IO URL: http://localhost:5001/socket.io")
    print("=====================\n")
    
    socketio.run(app, host='0.0.0.0', port=5001, debug=True)
