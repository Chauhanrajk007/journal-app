from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, auth, db
import tempfile
import json

app = Flask(_name_)
CORS(app)


# Initialize Firebase Admin SDK
try:
    cred = credentials.Certificate("journal-app-f3d32-firebase-adminsdk-fbsvc-4f21630aea.json")
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://journal-app-f3d32-default-rtdb.firebaseio.com/'
    })
except Exception as e:
    print(f"Firebase initialization error: {e}")
# API ROUTES

@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        email = data['email']
        password = data['password']

        user = auth.create_user(email=email, password=password)
        return jsonify({"message": "User created", "uid": user.uid}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data['email']
        password = data['password']

        # Firebase Admin SDK can't verify password directly.
        return jsonify({
            "error": "Firebase Admin SDK does not support verifying user passwords. Use Firebase Client SDK (on frontend) to log in and send token to backend for verification."
        }), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/')
def index():
    return jsonify({"message": "Journal App Backend is Running"}), 200
@app.route('/chatbot', methods=['POST'])
def chatbot():
    try:
        data = request.json
        user_message = data.get('message', '').lower()

        if not user_message:
            return jsonify({"response": "Please type something!"}), 400

        # Basic chatbot logic
        if "hello" in user_message or "hi" in user_message:
            response = "Hey there! How are you feeling today?"
        elif "how are you" in user_message:
            response = "I'm just code, but I'm happy to chat with you!"
        elif "sad" in user_message or "depressed" in user_message or "down" in user_message:
            response = "I'm sorry to hear that. Want to write a journal entry about it? It might help."
        elif "prompt" in user_message:
            response = "Here's a prompt: What's one thing that made you smile this week?"
        elif "bye" in user_message:
            response = "Take care! I'm always here when you want to talk."
        else:
            response = "I see. Tell me more, or type 'give me a prompt' to get started."

        return jsonify({"response": response})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '_main_':
    app.run(debug=True)
