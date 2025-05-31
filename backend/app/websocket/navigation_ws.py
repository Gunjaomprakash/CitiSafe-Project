from flask_socketio import Namespace, emit
import requests
import json
import pandas as pd
from math import radians, sin, cos, sqrt, atan2
import numpy as np

class NavigationNamespace(Namespace):
    def __init__(self, namespace=None):
        super().__init__(namespace)
        # Load crime data with risk factors
        self.crime_df = pd.read_csv('app/data/Crimes_df_with_risk.csv')
        # Convert coordinates to radians for faster distance calculation
        self.crime_df['lat_rad'] = np.radians(self.crime_df['Latitude'])
        self.crime_df['lng_rad'] = np.radians(self.crime_df['Longitude'])

    def haversine_distance(self, lat1, lon1, lat2, lon2):
        """Calculate the great circle distance between two points on the earth"""
        R = 6371  # Earth's radius in kilometers

        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1

        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        distance = R * c

        return distance * 1000  # Convert to meters

    def get_risk_level(self, lat, lng, radius_meters=50):
        """Get risk level for a given coordinate"""
        try:
            # Calculate distances using vectorized operations
            distances = self.haversine_distance(
                lat, lng,
                self.crime_df['Latitude'],
                self.crime_df['Longitude']
            )

            # Get points within radius
            nearby_points = self.crime_df[distances <= radius_meters]

            if len(nearby_points) == 0:
                return "Low"

            # Calculate average risk factor - convert to float explicitly
            avg_risk = float(nearby_points['risk_factor'].mean())

            # Determine risk level based on average risk factor
            if avg_risk >= 7:
                return "High"
            elif avg_risk >= 4:
                return "Medium"
            else:
                return "Low"
        except Exception as e:
            print(f"Error calculating risk level: {str(e)}")
            return "Low"  # Default to low risk on error

    def on_connect(self):
        print("Client connected to navigation namespace")
        emit('response', {'message': 'Connected to navigation WebSocket.'})

    def on_route_request(self, data):
        print(f"Received route request with data: {data}")
        try:
            # Extract start and end coordinates from the request
            start_lat = data.get('start_lat')
            start_lng = data.get('start_lng')
            end_lat = data.get('end_lat')
            end_lng = data.get('end_lng')

            if not all([start_lat, start_lng, end_lat, end_lng]):
                print("Missing coordinates in request")
                emit('response', {'error': 'Missing required coordinates'})
                return

            # Construct OSRM API URL for multiple routes
            url = f"http://router.project-osrm.org/route/v1/driving/{start_lng},{start_lat};{end_lng},{end_lat}?alternatives=true&overview=full&geometries=geojson&steps=true&annotations=true"
            print(f"Calling OSRM API: {url}")

            # Make request to OSRM API
            response = requests.get(url)
            response.raise_for_status()
            
            # Parse the response
            routes_data = response.json()
            
            if routes_data.get('code') != 'Ok':
                print("OSRM API returned error")
                emit('response', {'error': 'Failed to find routes'})
                return

            # Format the routes for the client
            routes = []
            for idx, route in enumerate(routes_data.get('routes', [])):
                steps = []
                route_points = []
                
                for leg in route.get('legs', []):
                    for step in leg.get('steps', []):
                        # Extract points for this step
                        step_points = []
                        if 'geometry' in step and 'coordinates' in step['geometry']:
                            for coord in step['geometry']['coordinates']:
                                # OSRM returns coordinates as [longitude, latitude]
                                point = {
                                    'lat': coord[1],
                                    'lng': coord[0],
                                    'risk_level': self.get_risk_level(coord[1], coord[0])
                                }
                                step_points.append(point)
                                route_points.append(point)
                        
                        steps.append({
                            'instruction': step.get('maneuver', {}).get('instruction', ''),
                            'distance': step.get('distance', 0),
                            'duration': step.get('duration', 0),
                            'points': step_points,
                            'road_name': step.get('name', 'Unknown road'),
                            'risk_level': self._get_step_risk_level(step_points)
                        })

                route_info = {
                    'id': idx + 1,
                    'distance': route.get('distance', 0),
                    'duration': route.get('duration', 0),
                    'points': route_points,
                    'steps': steps,
                    'summary': {
                        'distance_km': round(route.get('distance', 0) / 1000, 1),
                        'duration_min': round(route.get('duration', 0) / 60, 1),
                        'primary_road': self._get_primary_road(route),
                        'risk_summary': self._get_route_risk_summary(route_points)
                    }
                }
                routes.append(route_info)

            print(f"Sending {len(routes)} routes to client")
            emit('response', {
                'routes': routes,
                'message': f'Found {len(routes)} alternative routes',
                'waypoints': routes_data.get('waypoints', [])
            })

        except requests.exceptions.RequestException as e:
            print(f"OSRM API error: {str(e)}")
            emit('response', {'error': f'Error calling routing service: {str(e)}'})
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            emit('response', {'error': f'Unexpected error: {str(e)}'})

    def _get_primary_road(self, route):
        """Extract the primary road name from the route if available"""
        try:
            for leg in route.get('legs', []):
                for step in leg.get('steps', []):
                    if step.get('name'):
                        return step.get('name')
        except:
            pass
        return "Unknown road"

    def _get_step_risk_level(self, points):
        """Calculate the dominant risk level for a step"""
        risk_levels = [point['risk_level'] for point in points]
        if not risk_levels:
            return "Low"
        
        # Count occurrences of each risk level
        risk_counts = {
            "High": risk_levels.count("High"),
            "Medium": risk_levels.count("Medium"),
            "Low": risk_levels.count("Low")
        }
        
        # Return the most common risk level
        return max(risk_counts.items(), key=lambda x: x[1])[0]

    def _get_route_risk_summary(self, points):
        """Calculate risk summary for the entire route"""
        risk_levels = [point['risk_level'] for point in points]
        total_points = len(risk_levels)
        
        if total_points == 0:
            return {
                "high_risk_percentage": 0,
                "medium_risk_percentage": 0,
                "low_risk_percentage": 0,
                "dominant_risk": "Low"
            }
        
        risk_counts = {
            "High": risk_levels.count("High"),
            "Medium": risk_levels.count("Medium"),
            "Low": risk_levels.count("Low")
        }
        
        return {
            "high_risk_percentage": round(risk_counts["High"] / total_points * 100, 1),
            "medium_risk_percentage": round(risk_counts["Medium"] / total_points * 100, 1),
            "low_risk_percentage": round(risk_counts["Low"] / total_points * 100, 1),
            "dominant_risk": max(risk_counts.items(), key=lambda x: x[1])[0]
        }
