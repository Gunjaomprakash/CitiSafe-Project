from flask_socketio import SocketIO
from .chat_ws import ChatNamespace
from .navigation_ws import NavigationNamespace
from .timelapse_ws import TimelapseNamespace

class WebSocketManager:
    def __init__(self, app=None):
        self.socketio = SocketIO(
            cors_allowed_origins="*",
            async_mode='gevent',
            logger=True,
            engineio_logger=True,
            allow_unsafe_werkzeug=True  # For development only
        )
        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        """Initialize the WebSocket manager with the Flask app"""
        self.socketio.init_app(app)
        
        # Register all namespaces
        self.register_namespaces()

    def register_namespaces(self):
        """Register all WebSocket namespaces"""
        # Chat namespace for real-time chat
        self.socketio.on_namespace(ChatNamespace('/chat'))
        
        # Navigation namespace for route finding
        self.socketio.on_namespace(NavigationNamespace('/navigation'))
        
        # Timelapse namespace for crime data visualization
        self.socketio.on_namespace(TimelapseNamespace('/timelapse'))

    def run(self, app, **kwargs):
        """Run the WebSocket server"""
        self.socketio.run(app, **kwargs)

# Create a global instance
ws_manager = WebSocketManager() 