#!/usr/bin/env python3
"""
Simple WebSocket client test for the chat WebSocket endpoint.
Run this in a separate terminal while your Flask server is running.
"""
import socketio
import time

# Create a Socket.IO client
sio = socketio.Client()

@sio.event
def connect():
    print("Connected to server!")

@sio.event
def disconnect():
    print("Disconnected from server!")

# Register event handlers for both 'message' and 'response' events
@sio.on('message')
def on_message(data):
    print(f"Received message event: {data}")

@sio.on('response')
def on_response(data):
    print(f"Received response event: {data}")

# Connect to the server
try:
    sio.connect('http://localhost:5500', namespaces=['/ws/chat'])
    print("Connected to namespaces")
    
    # Send a test message
    sio.emit('message', 'Hello from Python client', namespace='/ws/chat')
    print("Message sent")
    
    # Send another message as JSON
    sio.emit('message', {'message': 'Hello as JSON'}, namespace='/ws/chat')
    print("JSON message sent")
    
    # Wait a bit to receive responses
    time.sleep(2)
    
except Exception as e:
    print(f"Connection failed: {e}")
finally:
    if sio.connected:
        sio.disconnect()
