from flask_socketio import SocketIO, emit
from flask import request
from app.model.gemini_agent import GeminiAgent, ToolCategory
import os
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize SocketIO with threading mode
socketio = SocketIO(cors_allowed_origins="*", async_mode='threading', logger=True, engineio_logger=True)
gemini_agent = None

def init_socketio(app):
    global gemini_agent
    try:
        logger.info("Initializing SocketIO...")
        socketio.init_app(app)
        api_key = os.getenv("AI_API_KEY")
        if not api_key:
            raise ValueError("AI_API_KEY environment variable is not set")
        gemini_agent = GeminiAgent(api_key=api_key)
        logger.info("SocketIO initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing SocketIO: {str(e)}")
        raise

@socketio.on('connect')
def handle_connect():
    logger.info(f"Client connected: {request.sid}")
    try:
        # Send available tools to the client upon connection
        tools_info = gemini_agent.get_available_tools()
        emit('connection_response', {
            'data': 'Connected',
            'available_tools': tools_info
        })
        logger.info(f"Sent tools info to client {request.sid}")
    except Exception as e:
        logger.error(f"Error in handle_connect: {str(e)}")
        emit('error', {'message': str(e)})

@socketio.on('disconnect')
def handle_disconnect():
    logger.info(f"Client disconnected: {request.sid}")

@socketio.on('chat_message')
def handle_message(data):
    logger.info(f"Received message from {request.sid}: {data}")
    try:
        message = data.get('message', '')
        tool_name = data.get('tool')
        
        if tool_name:
            # Handle tool execution
            tool_data = data.get('tool_data', {})
            if tool_name in gemini_agent.tools:
                tool = gemini_agent.tools[tool_name]
                result = tool.function(**tool_data)
                emit('tool_response', {
                    'tool': tool_name,
                    'result': result,
                    'category': tool.category.value
                })
                logger.info(f"Tool {tool_name} executed successfully")
            else:
                error_msg = f'Tool {tool_name} not found'
                logger.warning(error_msg)
                emit('error', {
                    'message': error_msg,
                    'available_tools': gemini_agent.get_available_tools()
                })
        else:
            # Handle regular chat
            response = gemini_agent.chat(message)
            emit('chat_response', response)
            logger.info(f"Chat response sent to {request.sid}")
            
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error in handle_message: {error_msg}")
        emit('error', {
            'message': error_msg,
            'type': 'error'
        })

@socketio.on('get_tools')
def handle_get_tools():
    """Handle request for available tools"""
    logger.info(f"Tools requested by {request.sid}")
    try:
        tools_info = gemini_agent.get_available_tools()
        emit('tools_response', {
            'tools': tools_info
        })
        logger.info(f"Tools info sent to {request.sid}")
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error in handle_get_tools: {error_msg}")
        emit('error', {'message': error_msg}) 