#!/usr/bin/env python3
"""
Minimal proxy server for Faculty AI Content Generator
This allows the HTML file to communicate with Anthropic's API
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from anthropic import Anthropic
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Anthropic client
api_key = os.getenv('ANTHROPIC_API_KEY')
if not api_key:
    print("ERROR: ANTHROPIC_API_KEY not found in .env file!")
    print("Please create a .env file with your API key:")
    print("ANTHROPIC_API_KEY=your_key_here")
    exit(1)

client = Anthropic(api_key=api_key)


@app.route('/api/generate', methods=['POST'])
def generate():
    """Proxy endpoint for Claude API calls"""
    try:
        data = request.json
        prompt = data.get('prompt')
        max_tokens = data.get('max_tokens', 4096)

        if not prompt:
            return jsonify({'error': 'No prompt provided'}), 400

        # Call Claude API
        response = client.messages.create(
            model='claude-3-5-sonnet-20241022',
            max_tokens=max_tokens,
            messages=[{
                'role': 'user',
                'content': prompt
            }]
        )

        # Return the response
        return jsonify({
            'content': response.content[0].text
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'Proxy server is running'})


@app.route('/', methods=['GET'])
def index():
    """Root endpoint with instructions"""
    return """
    <html>
    <head><title>Faculty AI Content Generator - Proxy Server</title></head>
    <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px;">
        <h1>🚀 Proxy Server is Running!</h1>
        <p>The proxy server is active and ready to receive requests.</p>

        <h2>Next Steps:</h2>
        <ol>
            <li>Open <code>faculty_content_generator.html</code> in your browser</li>
            <li>The HTML file will automatically connect to this proxy server</li>
            <li>Start generating course content!</li>
        </ol>

        <h2>Status:</h2>
        <ul>
            <li>✅ Server running on http://localhost:5000</li>
            <li>✅ API key configured</li>
            <li>✅ CORS enabled</li>
        </ul>

        <p><em>Keep this window open while using the content generator.</em></p>
    </body>
    </html>
    """


if __name__ == '__main__':
    print("=" * 60)
    print("Faculty AI Content Generator - Proxy Server")
    print("=" * 60)
    print(f"API Key: {'✅ Configured' if api_key else '❌ Missing'}")
    print("Server starting on http://localhost:5000")
    print("Keep this running while using the HTML file!")
    print("=" * 60)

    app.run(host='0.0.0.0', port=5000, debug=True)
