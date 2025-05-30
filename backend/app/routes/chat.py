from flask import Blueprint, request, jsonify

chat_bp = Blueprint("chat", __name__)

@chat_bp.route("/", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "")
    # Return dummy reply for testing
    response = {"reply": f"Dummy Gemini says: {user_message[::-1]}"}
    return jsonify(response)
