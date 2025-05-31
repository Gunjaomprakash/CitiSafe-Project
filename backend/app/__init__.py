from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from .websocket.chat_handler import init_socketio, socketio
from .websocket.navigation_ws import NavigationNamespace

def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable CORS for all routes
    app.config["SECRET_KEY"] = "your-secret-key"

    # Configure SocketIO
    socketio.init_app(app, 
                     cors_allowed_origins="*",
                     async_mode='threading',
                     logger=True,
                     engineio_logger=True)

    from .routes.chat import chat_bp
    from .routes.navigation import navigation_bp
    from .routes.timelapse import timelapse_bp

    app.register_blueprint(chat_bp, url_prefix="/chat")
    app.register_blueprint(navigation_bp, url_prefix="/navigation")
    app.register_blueprint(timelapse_bp, url_prefix="/timelapse")

    # Initialize WebSocket handler
    init_socketio(app)
    
    # Register navigation namespace
    socketio.on_namespace(NavigationNamespace('/navigation'))

    return app
