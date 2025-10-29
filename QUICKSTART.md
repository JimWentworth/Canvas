# Quick Start Guide - Faculty AI Content Generator

The **easiest way** to use the Faculty AI Content Generator with just a simple proxy server!

## 🚀 Super Simple Setup (5 minutes)

### Step 1: Get Your API Key
1. Go to https://console.anthropic.com/
2. Sign up for a free account
3. Navigate to "API Keys"
4. Click "Create Key"
5. Copy your API key (starts with `sk-ant-...`)

### Step 2: Configure the Proxy
```bash
# Create a .env file with your API key
echo "ANTHROPIC_API_KEY=your_key_here" > .env
```

### Step 3: Install Dependencies
```bash
pip install -r proxy_requirements.txt
```

### Step 4: Start the Proxy Server
```bash
python proxy_server.py
```

You should see:
```
============================================================
Faculty AI Content Generator - Proxy Server
============================================================
API Key: ✅ Configured
Server starting on http://localhost:5000
Keep this running while using the HTML file!
============================================================
```

### Step 5: Open the HTML File
1. Open `faculty_content_generator.html` in your web browser
2. Fill out the course generation form
3. Click "Generate Course Content"
4. Wait for your `.imscc` file to download!

## 📋 What You Need

- **Python 3.7+** (probably already installed)
- **Anthropic API Key** (free tier available)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **5 minutes of setup time**

## 🎯 How It Works

```
[HTML File in Browser]
       ↓
[Proxy Server on localhost:5000]
       ↓
[Anthropic Claude API]
       ↓
[Common Cartridge File Download]
```

The proxy server:
- Runs on your computer
- Keeps your API key secure
- Handles communication with Anthropic
- Enables the HTML file to work in your browser

## ⚡ Quick Commands

```bash
# One-time setup
echo "ANTHROPIC_API_KEY=your_key_here" > .env
pip install -r proxy_requirements.txt

# Every time you want to use the tool
python proxy_server.py
# (Then open faculty_content_generator.html in browser)
```

## 🔧 Troubleshooting

### "ANTHROPIC_API_KEY not found"
- Make sure you created the `.env` file
- Check that your API key is correct
- Don't include quotes around the key

### "Connection refused" error in browser
- Make sure the proxy server is running
- Check that it's running on port 5000
- Look for error messages in the terminal

### Proxy won't start
- Make sure port 5000 isn't already in use
- Try: `python3 proxy_server.py` instead
- Reinstall dependencies: `pip install -r proxy_requirements.txt`

### Content generation fails
- Check that your API key is valid
- Verify you have API credits available
- Look at the terminal for error messages

## 💡 Tips

1. **Keep the terminal open** - The proxy must run while you use the HTML file
2. **Start small** - Try 2-3 weeks first to test
3. **Be patient** - Generation takes about 30-60 seconds per week
4. **Check credits** - Monitor your API usage at console.anthropic.com

## 📊 Generation Time

- **2-3 weeks**: 1-2 minutes
- **5-8 weeks**: 3-5 minutes
- **10-12 weeks**: 6-8 minutes
- **16 weeks**: 10-12 minutes

## 🎓 Import to Canvas

1. Download the `.imscc` file
2. In Canvas → Course → **Settings**
3. **Import Course Content**
4. Select **Common Cartridge 1.x Package**
5. Upload the file
6. Click **Import**

## 📁 Files You Need

- `proxy_server.py` - The proxy server (runs in terminal)
- `faculty_content_generator.html` - The web interface (open in browser)
- `proxy_requirements.txt` - Python dependencies
- `.env` - Your API key (you create this)

## 🆘 Need Help?

Check that:
- [ ] You created the `.env` file with your API key
- [ ] The proxy server is running (terminal window open)
- [ ] The HTML file is opened in a browser
- [ ] Your API key is valid and has credits
- [ ] Port 5000 is available

## 🌟 Advantages of This Setup

✅ **Simple** - Just Python + HTML, no complex frameworks
✅ **Secure** - API key stays on your computer
✅ **Portable** - Works on any computer with Python
✅ **Lightweight** - Minimal dependencies
✅ **Fast** - No database or authentication overhead

---

**Ready to generate courses?** Follow the 5 steps above and you'll be creating AI-powered Canvas courses in minutes!
