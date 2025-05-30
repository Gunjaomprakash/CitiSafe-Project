from flask_socketio import Namespace, emit

class TimelapseNamespace(Namespace):
    def on_connect(self):
        emit('response', {'message': 'Connected to timelapse WebSocket.'})

    def on_timelapse_request(self, data):
        # Return dummy heatmap data for testing
        place = data.get('place', 'Unknown')
        year = data.get('year', 2024)
        dummy_heatmap = {
            'place': place,
            'year': year,
            'data': [
                {'lat': 12.9716, 'lng': 77.5946, 'intensity': 0.8},
                {'lat': 12.2958, 'lng': 76.6394, 'intensity': 0.5},
                {'lat': 13.0827, 'lng': 80.2707, 'intensity': 0.6}
            ]
        }
        emit('response', {'data': dummy_heatmap})
