import socketio
import time

# Create a Socket.IO client
sio = socketio.Client()

@sio.event
def connect():
    print('Connected to server')

@sio.event
def disconnect():
    print('Disconnected from server')

@sio.on('response')
def on_response(data):
    print("\nReceived response:")
    if 'error' in data:
        print(f"Error: {data['error']}")
    else:
        print(f"Message: {data['message']}")
        print(f"Number of routes: {len(data['routes'])}")
        
        # Print details for each route
        for route in data['routes']:
            print(f"\nRoute {route['id']}:")
            print(f"Distance: {route['summary']['distance_km']} km")
            print(f"Duration: {route['summary']['duration_min']} minutes")
            print(f"Primary road: {route['summary']['primary_road']}")
            print(f"Number of points: {len(route['points'])}")
            print(f"Number of steps: {len(route['steps'])}")
            
            # Print first few points of the route
            print("\nFirst 3 points of the route:")
            for point in route['points'][:3]:
                print(f"  Lat: {point['lat']}, Lng: {point['lng']}")
            
            # Print first few steps
            print("\nFirst 3 steps:")
            for step in route['steps'][:3]:
                print(f"  Instruction: {step['instruction']}")
                print(f"  Road: {step['road_name']}")
                print(f"  Distance: {step['distance']}m")
                print(f"  Duration: {step['duration']}s")
                print(f"  Number of points in step: {len(step['points'])}")
                print()

def main():
    try:
        # Connect to the server
        sio.connect('http://localhost:5001')
        
        # Wait for connection to establish
        time.sleep(1)
        
        # Test coordinates (Bangalore to Mysore)
        test_data = {
            'start_lat': 12.9716,
            'start_lng': 77.5946,
            'end_lat': 12.2958,
            'end_lng': 76.6394
        }
        
        print("\nSending route request with data:")
        print(f"Start: {test_data['start_lat']}, {test_data['start_lng']}")
        print(f"End: {test_data['end_lat']}, {test_data['end_lng']}")
        
        # Send the route request
        sio.emit('route_request', test_data)
        
        # Wait for response
        time.sleep(5)
        
    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        sio.disconnect()

if __name__ == "__main__":
    main()