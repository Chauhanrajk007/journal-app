from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, auth, db
import tempfile
import json

app = Flask(_name_)
CORS(app)

# Firebase config as dictionary
firebase_config = {
    "type": "service_account",
    "project_id": "journal-app-f3d32",
    "private_key_id": "YOUR_PRIVATE_KEY_ID",
    "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-9h9ei@journal-app-f3d32.iam.gserviceaccount.com",
    "client_id": "YOUR_CLIENT_ID",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-9h9ei%40journal-app-f3d32.iam.gserviceaccount.com"
}

# Initialize Firebase Admin SDK
try:
    with tempfile.NamedTemporaryFile(mode='w+', delete=False, suffix='.json') as tmp_file:
        json.dump(firebase_config, tmp_file)
        tmp_file.flush()
        cred = credentials.Certificate(tmp_file.name)
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

if _name_ == '_main_':
    app.run(debug=True)
