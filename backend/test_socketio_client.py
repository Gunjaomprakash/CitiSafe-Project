import socketio
import time

# Create a Socket.IO client
sio = socketio.Client()

@sio.event
def connect():
    print('Connected to server')

@sio.event
def connect_error(data):
    print('Connection error:', data)

@sio.event
def disconnect():
    print('Disconnected from server')

@sio.on('response')
def on_response(data):
    print("\nReceived response:")
    print(data)

def main():
    try:
        # Connect to the server
        print("Connecting to server...")
        sio.connect('http://localhost:5001', namespaces=['/navigation'])
        
        # Wait for connection to establish
        time.sleep(1)
        
        # Test coordinates
        test_data = {
            'start_lat': 12.9716,
            'start_lng': 77.5946,
            'end_lat': 12.2958,
            'end_lng': 76.6394
        }
        
        print("\nSending route request with data:")
        print(test_data)
        
        # Send the route request to the navigation namespace
        sio.emit('route_request', test_data, namespace='/navigation')
        
        # Wait for response
        time.sleep(5)
        
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        sio.disconnect()

if __name__ == "__main__":
    main() 