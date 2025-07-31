from flask import Flask, request, jsonify
from flask_cors import CORS

# This is a simple list in memory that will act as our chat message database.
# It will reset every time you restart the server.
messages = [
    {"username": "System", "text": "Welcome! The server is online."}
]

app = Flask(__name__)

# This is CRITICAL. It allows the Vercel website to make requests
# to your ngrok server. Without it, you'll get a CORS security error.
CORS(app) 

# This is the "endpoint" your frontend will call to get all the latest messages.
@app.route("/messages", methods=['GET'])
def get_messages():
    return jsonify(messages)

# This is the "endpoint" your frontend will call to send a new message.
@app.route("/send", methods=['POST'])
def send_message():
    # Get the JSON data from the request (e.g., {"username": "dillon", "text": "hello"})
    new_message = request.get_json()

    # Print it to your terminal so you can see it working!
    print(f"Received new message: {new_message}")

    # Add the new message to our list
    messages.append(new_message)

    # Send back a success response
    return jsonify({"status": "Message sent successfully"})

if __name__ == "__main__":
    # Run the server on port 5000, accessible from anywhere on the network
    app.run(host="0.0.0.0", port=5000)