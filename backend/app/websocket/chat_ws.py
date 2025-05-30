from flask_socketio import Namespace, emit

class ChatNamespace(Namespace):
    def on_connect(self):
        print(f"Client connected to chat namespace")
        emit('message', {'message': 'Connected to chat WebSocket.'})  # Using 'message' event which is standard
        emit('response', {'message': 'Connected to chat WebSocket.'})  # Using previous 'response' event
    
    def on_disconnect(self):
        print(f"Client disconnected from chat namespace")
    
    def on_message(self, data):
        print(f"Received 'message' event with data: {data}")
        self._handle_data(data)
    
    def on_chat_message(self, data):
        print(f"Received 'chat_message' event with data: {data}")
        self._handle_data(data)
        
    # Standard Socket.IO event
    def on_event(self, event, *args):
        print(f"Received custom event: {event} with args: {args}")
        if args:
            self._handle_data(args[0])
            
    def _handle_data(self, data):
        message = ''
        if isinstance(data, dict):
            message = data.get('message', '')
        elif isinstance(data, str):
            message = data
        else:
            message = str(data)
        
        print(f"Sending response with message: {message}")
        # Emit on both standard event names to ensure compatibility
        emit('message', {'reply': f"Echo {message}"})
        emit('response', {'reply': f"Echo {message}"})
