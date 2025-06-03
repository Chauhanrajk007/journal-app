from flask import Flask, render_template, request, jsonify
import openai

app = Flask(_name_)

openai.api_key = "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"

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json['message']
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a friendly mental health journaling assistant named Buddy."},
                {"role": "user", "content": user_message}
            ]
        )
        reply = response['choices'][0]['message']['content']
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"reply": "Oops, something went wrong."})

if _name_ == '_main_':
    app.run(debug=True)
