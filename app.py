from flask import Flask, render_template, request, jsonify
from flask_cors import CORS

app = Flask(_name_)
CORS(app)

@app.route('/')
def home():
    return render_template("index.html")

@app.route('/chat', methods=['POST'])
def chat():
    user_msg = request.json.get("message")
    # Placeholder AI logic (you can replace with OpenAI API if needed)
    response = "That sounds interesting. Tell me more!" if user_msg else "Say something!"
    return jsonify({"reply": response})

if _name_ == "_main_":
    app.run(debug=True)
