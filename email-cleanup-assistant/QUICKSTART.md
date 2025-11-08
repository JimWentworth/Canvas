# Quick Start Guide

## Simplest Way to Start

```bash
./start.sh
```

That's it! The script will:
1. Install dependencies if needed
2. Install Playwright browsers
3. Create .env file
4. Start the server at http://localhost:3000

## Manual Start

If you prefer manual setup:

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers
npx playwright install chromium

# 3. Start the server
npm start
```

## Troubleshooting

### "Error loading recipes" in browser

The backend is working fine. This is usually a browser cache issue:

**Solutions:**
1. **Hard refresh**: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. **Open in incognito/private window**
3. **Clear browser cache** completely
4. **Check browser console** (F12 → Console) for JavaScript errors

**Verify the server is working:**
```bash
# Test the API directly
curl http://localhost:3000/api/recipes

# Should return JSON with 3 recipes:
# {"success":true,"sites":[...]}
```

**If you see errors in console:**
- Check that the server is running (should show "Email Cleanup Assistant initialized successfully")
- Make sure you're accessing `http://localhost:3000` (not `https://`)
- Try a different browser

### Browser doesn't open during automation

```bash
# Make sure Playwright browsers are installed
npx playwright install chromium

# Check .env file has:
HEADLESS=false
```

### "Module not found" errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 already in use

```bash
# Option 1: Kill the process using port 3000
lsof -ti:3000 | xargs kill

# Option 2: Use a different port
PORT=3001 npm start
```

## First Time Usage

1. **Start the server**:
   ```bash
   ./start.sh
   ```

2. **Open your browser** to: http://localhost:3000

3. **You should see:**
   - Chat interface on the left
   - Available Sites list on the right (Netflix, GitHub, Demo Site)
   - Status indicator showing "Connected"

4. **Test it:**
   - Type a message in the chat: "Hello"
   - Click on a site in the "Available Sites" panel
   - Fill in test credentials (don't use real ones yet!)

## Adding OpenAI (Optional)

AI features work without OpenAI using rule-based responses. To enable full AI:

1. **Edit `.env`:**
   ```bash
   OPENAI_API_KEY=sk-your-api-key-here
   ```

2. **Restart the server**:
   - Press `Ctrl+C`
   - Run `npm start` again

3. **Verify**:
   - Server should show: "AI: Enabled (OpenAI)"

## Verification Checklist

After starting, verify everything works:

- [ ] Server shows "3 recipes loaded"
- [ ] Browser connects to http://localhost:3000
- [ ] Chat interface shows welcome message
- [ ] Sites panel shows 3 sites (Netflix, GitHub, Demo Site)
- [ ] Status shows "Connected" with green dot
- [ ] No errors in browser console (F12)

## Next Steps

1. **Test with Demo Site** (non-functional, just for testing UI)
2. **Add your OpenAI key** for better AI responses (optional)
3. **Create test accounts** on sites you want to automate
4. **Test automation** with those test accounts first
5. **Create custom recipes** for your frequently-used sites

## Getting Help

If you're stuck:

1. **Check server logs** in the terminal
2. **Check browser console** (F12 → Console tab)
3. **Test API endpoints** with curl (see above)
4. **Review the full README.md** for detailed documentation

## Common First-Run Issues

**"Cannot find module 'playwright'"**
→ Run: `npx playwright install chromium`

**Page shows but sites don't load**
→ Hard refresh: `Ctrl+Shift+R` or try incognito mode

**Chat not responding**
→ Check status indicator - should show "Connected"

**Automation doesn't start**
→ Verify Playwright is installed and HEADLESS=false

---

**Ready to go?** Run `./start.sh` and open http://localhost:3000 🚀
