from flask import Blueprint, request, jsonify

timelapse_bp = Blueprint("timelapse", __name__)

@timelapse_bp.route("/", methods=["POST"])
def timelapse():
    data = request.get_json()
    place = data.get("place", "Unknown")
    year = data.get("year", 2024)
    # Return dummy heatmap data for testing
    heatmap_data = {
        "place": place,
        "year": year,
        "data": [
            {"lat": 12.9716, "lng": 77.5946, "intensity": 0.8},
            {"lat": 12.2958, "lng": 76.6394, "intensity": 0.5},
            {"lat": 13.0827, "lng": 80.2707, "intensity": 0.6}
        ]
    }
    return jsonify(heatmap_data)
