from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import datetime

app = Flask(_name_, static_folder='static', template_folder='templates')
CORS(app)

# Serve the HTML UI
@app.route('/')
def home():
    return render_template('index.html')

# Simple AI Chatbot simulation (replace with OpenAI API if needed)
@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message', '').strip().lower()
    if not user_message:
        return jsonify({"reply": "Please say something!"})
    
    # Very basic bot logic
    if "how are you" in user_message:
        reply = "I'm doing great! How about you?"
    elif "hi" in user-message:
        reply = "I'm doing great! How about you"
    elif "bye" in user_message:
        reply = "Goodbye! Come back soon to journal more!"
    else:
        reply = "That's interesting! Tell me more."

    return jsonify({"reply": reply})

if _name_ == '_main_':
    app.run(debug=True)
