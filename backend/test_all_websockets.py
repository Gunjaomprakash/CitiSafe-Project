#!/usr/bin/env python3
"""
Test client for all WebSocket endpoints (chat, navigation, and timelapse).
Run this in a separate terminal while your Flask server is running.
"""
import socketio
import time
import json

# Create a Socket.IO client
sio = socketio.Client()

# Test data
TEST_COORDINATES = {
    "start_lat": 12.9716,
    "start_lng": 77.5946,
    "end_lat": 12.2958,
    "end_lng": 76.6394
}

TEST_TIMELAPSE = {
    "place": "Bangalore",
    "year": 2024
}

# Event handlers for all namespaces
@sio.event
def connect():
    print("Connected to server!")

@sio.event
def disconnect():
    print("Disconnected from server!")

# Chat namespace handlers
@sio.on('response', namespace='/ws/chat')
def on_chat_response(data):
    print("\n=== Chat Response ===")
    print(json.dumps(data, indent=2))

# Navigation namespace handlers
@sio.on('response', namespace='/ws/navigation')
def on_nav_response(data):
    print("\n=== Navigation Response ===")
    print(json.dumps(data, indent=2))

# Timelapse namespace handlers
@sio.on('response', namespace='/ws/timelapse')
def on_timelapse_response(data):
    print("\n=== Timelapse Response ===")
    print(json.dumps(data, indent=2))

def test_all_websockets():
    try:
        # Connect to all namespaces
        sio.connect('http://localhost:5500', 
                   namespaces=['/ws/chat', '/ws/navigation', '/ws/timelapse'])
        print("Connected to all namespaces")
        
        # Test Chat
        print("\nTesting Chat WebSocket...")
        sio.emit('message', 'Hello from test client', namespace='/ws/chat')
        time.sleep(1)
        
        # Test Navigation
        print("\nTesting Navigation WebSocket...")
        sio.emit('route_request', TEST_COORDINATES, namespace='/ws/navigation')
        time.sleep(2)
        
        # Test Timelapse
        print("\nTesting Timelapse WebSocket...")
        sio.emit('timelapse_request', TEST_TIMELAPSE, namespace='/ws/timelapse')
        time.sleep(2)
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if sio.connected:
            sio.disconnect()
            print("\nDisconnected from all namespaces")

if __name__ == "__main__":
    test_all_websockets() 