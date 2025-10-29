# Faculty AI Content Generator - Standalone HTML Version

A single HTML file that generates AI-powered Canvas course content entirely in your browser!

## 🎯 Quick Start

1. **Open the file**: Simply open `faculty_content_generator.html` in any modern web browser (Chrome, Firefox, Safari, Edge)

2. **Get an API key**:
   - Go to [console.anthropic.com](https://console.anthropic.com/)
   - Sign up for a free account
   - Create an API key
   - Copy the key (starts with `sk-ant-...`)

3. **Generate content**:
   - Paste your API key into the form
   - Fill in your course details
   - Click "Generate Course Content"
   - Wait for the download to complete

That's it! No installation, no server, no command line required.

## ✨ Features

- **🌐 Browser-Based**: Runs entirely in your browser - no backend needed
- **🔒 Private**: Your API key is only used in your browser and never stored
- **📦 Complete Package**: Downloads ready-to-import Common Cartridge files
- **📊 Progress Tracking**: See real-time progress as content is generated
- **🎨 Beautiful UI**: Clean, professional interface

## 📋 What Gets Generated

For each week of your course:
- **Introduction Page**: Engaging welcome with learning objectives
- **Lecture Page**: Comprehensive content covering the weekly topic

All organized into weekly modules in a Common Cartridge (.imscc) file.

## 🔑 About API Keys

### Getting Your Key
1. Visit [console.anthropic.com](https://console.anthropic.com/)
2. Sign up (free tier available)
3. Go to API Keys section
4. Click "Create Key"
5. Copy your key

### Free Tier
Anthropic offers free API credits for new users. Check their pricing page for current limits.

### Security
- Your API key is **only used in your browser**
- It's **never stored** on your computer
- It's **only sent to Anthropic's API**
- You'll need to paste it each time you use the tool

## 📥 Importing to Canvas

1. Download the `.imscc` file from the tool
2. In Canvas, go to your course
3. Click **Settings** → **Import Course Content**
4. Select **Common Cartridge 1.x Package**
5. Upload the `.imscc` file
6. Click **Import**
7. Review and publish the content

## ⏱️ Generation Time

Generation time depends on the number of weeks:
- **1-5 weeks**: ~2-5 minutes
- **6-10 weeks**: ~5-10 minutes
- **11-16 weeks**: ~10-15 minutes
- **17+ weeks**: 15+ minutes

**Tip**: Start with 2-3 weeks to test the output before generating a full course.

## 💡 Tips for Best Results

1. **Be Specific**: Use detailed subject areas (e.g., "Cognitive Psychology" vs "Psychology")
2. **Use Context**: The additional context field helps tailor content to your needs
3. **Choose Audience**: Select the right level for appropriate content difficulty
4. **Review Content**: Always review and customize in Canvas after import
5. **Start Small**: Test with fewer weeks first

## 🛠️ Technical Details

- **No Installation Required**: Just a single HTML file
- **Libraries Used**:
  - JSZip 3.10.1 (for creating .imscc files)
  - Vanilla JavaScript (no frameworks)
- **API**: Anthropic Claude API (claude-3-5-sonnet-20241022)
- **Output Format**: IMS Common Cartridge 1.1

## 🔧 Troubleshooting

### "API request failed"
- Check that your API key is correct
- Ensure you have API credits available
- Check your internet connection

### Download doesn't start
- Check browser's download settings
- Allow downloads from local files
- Try a different browser

### Content quality issues
- Provide more context in the additional context field
- Be more specific in the subject area
- Choose a more appropriate target audience

### Generation takes too long
- Reduce the number of weeks
- Check your internet connection
- Be patient - each week requires 2 API calls

## 📝 Customization

After importing to Canvas, you can:
- Edit any generated content
- Add assignments, quizzes, discussions
- Reorder modules
- Add multimedia (videos, images)
- Customize styling

## 🌟 Advantages Over Django Version

### Standalone HTML:
- ✅ No server setup required
- ✅ No Python installation needed
- ✅ Works offline (after initial load)
- ✅ Portable - share the file with colleagues
- ✅ No maintenance needed

### Django Version:
- ✅ More secure API key storage
- ✅ Better for institutional deployment
- ✅ Can add user authentication
- ✅ Can save/reuse course structures
- ✅ Better for team environments

## 📄 File Compatibility

This tool generates IMS Common Cartridge 1.1 files compatible with:
- Canvas LMS
- Moodle
- Blackboard
- Brightspace D2L
- Most modern LMS platforms

## 🤝 Support

For issues or questions:
- Check the troubleshooting section above
- Review Anthropic's API documentation
- Check Canvas import documentation

## 📜 License

This tool is provided as-is for educational purposes.

---

**Ready to create your course?** Just open `faculty_content_generator.html` and get started!
