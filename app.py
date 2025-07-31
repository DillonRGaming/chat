from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os

# --- Flask App Setup ---
# The static_folder='.' tells Flask to look for files like index.html in the current folder.
app = Flask(__name__, static_folder='.')
CORS(app)

# --- In-Memory "Database" ---
messages = [{"username": "System", "text": "Welcome! The all-in-one server is running."}]

# --- API Endpoints (The Backend Brains) ---
# Note the new path: /api/... This keeps them separate from the frontend files.

@app.route("/api/messages", methods=['GET'])
def get_messages():
    return jsonify(messages)

@app.route("/api/send", methods=['POST'])
def send_message():
    new_message = request.get_json()
    messages.append(new_message)
    return jsonify({"status": "success"})


# --- Static File Serving (The Frontend Website) ---
# This new part serves your HTML, CSS, and JS files.

@app.route('/')
def serve_index():
    # This serves your main index.html file when someone visits the root URL.
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static_files(path):
    # This serves any other file requested, like style.css and script.js
    return send_from_directory('.', path)


# --- Main Execution ---
if __name__ == "__main__":
    print("--- Starting All-in-One Flask Server on http://localhost:5000 ---")
    app.run(host="0.0.0.0", port=5000)