from flask import Flask, render_template, request, jsonify, redirect, url_for
import firebase_admin
from firebase_admin import credentials, auth, firestore

app = Flask(__name__)

# Initialize Firebase
cred = credentials.Certificate("firebase_config.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

@app.route('/')
def auth_page():
    return render_template('auth.html')

@app.route('/diary')
def diary_page():
    return render_template('entry.html')

@app.route('/verify_token', methods=['POST'])
def verify_token():
    data = request.json
    id_token = data.get('idToken')
    try:
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        return jsonify({"status": "success", "uid": uid})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 401

@app.route('/save_entry', methods=['POST'])
def save_entry():
    data = request.json
    uid = data.get('uid')
    content = data.get('content')
    date = data.get('date')

    if not uid or not content or not date:
        return jsonify({"status": "error", "message": "Missing fields"}), 400

    doc_ref = db.collection('journals').document(f"{uid}_{date}")
    doc_ref.set({
        "uid": uid,
        "content": content,
        "date": date
    })
    return jsonify({"status": "success", "message": "Entry saved"})

if __name__ == '__main__':
    app.run(debug=True)
