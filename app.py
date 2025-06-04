from flask import Flask, render_template, request, jsonify
import firebase_admin
from firebase_admin import credentials, firestore, auth

app = Flask(__name__)

# Initialize Firebase
cred = credentials.Certificate("firebase_config.json")  # JSON key from Firebase
firebase_admin.initialize_app(cred)
db = firestore.client()

@app.route('/')
def home():
    return render_template('entry.html')

@app.route('/save', methods=['POST'])
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
