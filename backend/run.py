from app import create_app, socketio
from app.websocket.chat_ws import ChatNamespace
from app.websocket.navigation_ws import NavigationNamespace
from app.websocket.timelapse_ws import TimelapseNamespace

app = create_app()

# Register WebSocket namespaces
socketio.init_app(app, cors_allowed_origins="*")
socketio.on_namespace(ChatNamespace('/ws/chat'))
socketio.on_namespace(NavigationNamespace('/ws/navigation'))
socketio.on_namespace(TimelapseNamespace('/ws/timelapse'))

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5500)
