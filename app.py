from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, db

app = Flask(_name_)

# Initialize Firebase Admin SDK
cred = credentials.Certificate('path/to/your/firebase-adminsdk.json')
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://journal-app-f3d32-default-rtdb.firebaseio.com/'
})

@app.route('/save_entry', methods=['POST'])
def save_entry():
    user_id = request.json['user_id']
    entry = request.json['entry']
    date = request.json['date']
    
    ref = db.reference(f'users/{user_id}/journal/{date}')
    ref.set({'entry': entry})
    
    return jsonify({'status': 'success'})

if _name_ == '_main_':
    app.run(debug=True)
