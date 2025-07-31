from flask import Flask, request, jsonify
from flask_cors import CORS

messages = [{"username": "System", "text": "Welcome to the Global Chat!"}]

app = Flask(__name__)
CORS(app)

@app.route("/")
def hello():
    print("--- Served the root page ---")
    return "<h1>✅ Your Flask Backend is Running</h1><p>This server is the API for the chat app. It's working!</p>"

@app.route("/messages", methods=['GET'])
def get_messages():
    print(f"--- GET request for /messages. Sending {len(messages)} messages. ---")
    return jsonify(messages)

@app.route("/send", methods=['POST'])
def send_message():
    new_message = request.get_json()
    print(f"--- POST request to /send. Received: {new_message} ---")
    messages.append(new_message)
    return jsonify({"status": "success"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)