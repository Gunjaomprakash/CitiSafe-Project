from flask import Flask
from flask_socketio import SocketIO

def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "your-secret-key"

    from .routes.chat import chat_bp
    from .routes.navigation import navigation_bp
    from .routes.timelapse import timelapse_bp

    app.register_blueprint(chat_bp, url_prefix="/chat")
    app.register_blueprint(navigation_bp, url_prefix="/navigation")
    app.register_blueprint(timelapse_bp, url_prefix="/timelapse")

    return app

# Use threading mode for compatibility with Python 3.12
socketio = SocketIO(async_mode="threading")

# Initialize socketio with app in run.py
