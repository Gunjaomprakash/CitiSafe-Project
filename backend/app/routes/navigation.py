from flask import Blueprint, request, jsonify

navigation_bp = Blueprint("navigation", __name__)

@navigation_bp.route("/", methods=["POST"])
def navigation():
    data = request.get_json()
    source = data.get("source", "A")
    destination = data.get("destination", "B")
    # Return dummy routes for testing
    routes = [
        {"route": [source, "Midpoint1", destination], "distance": 10},
        {"route": [source, "Midpoint2", destination], "distance": 12}
    ]
    return jsonify({"routes": routes})
