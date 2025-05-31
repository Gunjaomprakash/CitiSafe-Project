# WebSocket Client Documentation

## Navigation Endpoint

### Overview
The navigation endpoint provides route information between two points using the OSRM routing service. It returns multiple alternative routes with detailed turn-by-turn instructions and route points.

### Connection Details
- **WebSocket URL**: `ws://localhost:5001/socket.io/?EIO=4&transport=websocket`
- **Namespace**: `/navigation`
- **Event**: `route_request`

### Request Format
```json
{
    "start_lat": 41.839672,
    "start_lng": -87.634289,
    "end_lat": 41.839728,
    "end_lng": -87.631848
}
```

### Response Format
```json
{
    "routes": [
        {
            "id": 1,
            "distance": 193,        // in meters
            "duration": 27.8,       // in seconds
            "points": [
                {
                    "lat": 41.839682,
                    "lng": -87.634289
                },
                // ... intermediate points
                {
                    "lat": 41.839718,
                    "lng": -87.631966
                }
            ],
            "steps": [
                {
                    "instruction": "",  // Turn-by-turn instruction
                    "distance": 193,    // in meters
                    "duration": 27.8,   // in seconds
                    "points": [
                        // Points for this specific step
                    ],
                    "road_name": "West 30th Street"
                }
            ],
            "summary": {
                "distance_km": 0.2,     // Total distance in kilometers
                "duration_min": 0.5,    // Total duration in minutes
                "primary_road": "West 30th Street"
            }
        }
    ],
    "message": "Found 1 alternative routes",
    "waypoints": [
        {
            "hint": "...",           // OSRM routing hint
            "location": [            // [longitude, latitude]
                -87.634289,
                41.839682
            ],
            "name": "West 30th Street",
            "distance": 1.110698867  // Distance to next waypoint
        }
    ]
}
```

### Response Fields
- `routes`: Array of alternative routes, each containing:
  - `id`: Route identifier
  - `distance`: Total distance in meters
  - `duration`: Total duration in seconds
  - `points`: Array of all points along the route, each containing:
    - `lat`: Latitude
    - `lng`: Longitude
  - `steps`: Array of route segments, each containing:
    - `instruction`: Text instruction for the turn (may be empty for straight segments)
    - `distance`: Distance for this step in meters
    - `duration`: Duration for this step in seconds
    - `points`: Array of points for this specific step
    - `road_name`: Name of the road for this step
  - `summary`: Route summary containing:
    - `distance_km`: Total distance in kilometers
    - `duration_min`: Total duration in minutes
    - `primary_road`: Primary road name for the route
- `message`: Status message indicating number of routes found
- `waypoints`: Array of waypoints used in the route, each containing:
  - `hint`: OSRM routing hint (used for optimization)
  - `location`: [longitude, latitude] of the waypoint
  - `name`: Road name at the waypoint
  - `distance`: Distance to the next waypoint

### Error Response
If an error occurs, the endpoint returns an error message:
```json
{
    "error": "Error message description"
}
```

### Notes
- The endpoint uses the OSRM routing service to calculate routes
- Multiple alternative routes are provided when available
- Each route includes detailed turn-by-turn instructions
- Points are provided in [latitude, longitude] format
- Distances are in meters, durations in seconds
- The response includes both the full route points and points for each step
- Waypoints include OSRM-specific data like routing hints
- Road names are included when available from OSRM
- Some steps may have empty instructions for straight segments
- The total route is broken down into steps for detailed navigation

## Timelapse Endpoint

### Overview
The timelapse endpoint provides filtered risk data for a specific location, year, and radius. It returns data points that can be used to create a heatmap visualization.

### Endpoint Details
- **URL**: `/timelapse`
- **Method**: GET
- **Query Parameters**:
  - `lat` (required): Latitude of the center point
  - `lon` (required): Longitude of the center point
  - `year` (required): Year to filter the data
  - `radius_km` (optional): Radius in kilometers (defaults to 2)

### Example Request
```
GET /timelapse?lat=12.9716&lon=77.5946&year=2023&radius_km=2
```

### Response Format
```json
{
    "place": "Location: 12.9716, 77.5946",
    "year": 2023,
    "data": [
        {
            "lat": 12.9716,
            "lng": 77.5946,
            "intensity": 0.8
        },
        // ... more data points
    ]
}
```

### Response Fields
- `place`: String describing the center location
- `year`: The year for which the data is filtered
- `data`: Array of data points, each containing:
  - `lat`: Latitude of the data point
  - `lng`: Longitude of the data point
  - `intensity`: Risk score or intensity value (0-1)

### Error Response
If an error occurs, the endpoint returns a 400 status code with an error message:
```json
{
    "error": "Error message description"
}
```

### Notes
- The endpoint filters data from the risk_data_filtered.csv file
- Data points are filtered based on the specified year and radius
- The radius calculation uses the Haversine formula to determine if points are within the specified distance
- Intensity values are taken from the Risk_Score column if available, otherwise defaulting to 0.5

## Chat Endpoint

### Overview
The chat endpoint provides real-time communication with the Gemini agent using Socket.IO. It supports sending chat messages and executing tools like logging incidents and web searches.

### Connection Details
- **WebSocket URL**: `ws://localhost:5001/socket.io/?EIO=4&transport=websocket`
- **Namespace**: `/` (default)
- **Events**:
  - `chat_message`: Send a chat message or tool request
  - `get_tools`: Request available tools

### Request Format
#### Chat Message
```json
{
    "message": "Hello, what can you help me with?"
}
```

#### Tool Request (e.g., Log Incident)
```json
{
    "tool": "log_incident",
    "tool_data": {
        "description": "Suspicious login attempt",
        "location": "192.168.1.100",
        "severity": "high",
        "additional_details": {
            "ip_address": "192.168.1.100",
            "attempt_count": 5
        }
    }
}
```

### Response Format
#### Chat Response
```json
{
    "reply": "I am a security assistant with access to various tools...",
    "status": "success"
}
```

#### Tool Response
```json
{
    "tool": "log_incident",
    "result": {
        "status": "success",
        "message": "Incident logged successfully",
        "incident_id": 1
    },
    "category": "data_management"
}
```

#### Tools Response
```json
{
    "tools": [
        {
            "name": "log_incident",
            "description": "Log a security incident with details like description, location, severity, and timestamp",
            "category": "data_management",
            "parameters": {
                "description": {"type": "string", "description": "Description of the incident"},
                "location": {"type": "string", "description": "Location where the incident occurred"},
                "severity": {"type": "string", "description": "Severity level (low/medium/high)"},
                "additional_details": {"type": "object", "description": "Any additional details about the incident"}
            }
        },
        {
            "name": "web_search",
            "description": "Search the web for information about security incidents, threats, or related topics",
            "category": "search",
            "parameters": {
                "query": {"type": "string", "description": "Search query"},
                "max_results": {"type": "integer", "description": "Maximum number of results to return"}
            }
        }
    ]
}
```

### Error Response
If an error occurs, the endpoint returns an error message:
```json
{
    "message": "Error message description",
    "type": "error"
}
```

### Notes
- The chat endpoint uses Socket.IO for real-time communication.
- Ensure your client is a Socket.IO client (not a raw WebSocket client).
- For testing, you can use the provided `socketio_test.html` page or a Socket.IO client library.
