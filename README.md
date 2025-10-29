# Faculty AI Content Tool

Generate AI-powered course content and export it as Common Cartridge files for import into Canvas LMS.

## ⚡ RECOMMENDED: HTML + Simple Proxy (Easiest!)

**Get started in 5 minutes!**

1. Get a free API key from https://console.anthropic.com/
2. Create `.env` file: `echo "ANTHROPIC_API_KEY=your_key" > .env`
3. Install: `pip install -r proxy_requirements.txt`
4. Run: `python proxy_server.py`
5. Open `faculty_content_generator.html` in your browser

**👉 [Complete Quick Start Guide](QUICKSTART.md)**

---

## 🚀 All Available Versions

### ⚡ HTML + Proxy (RECOMMENDED)
**Perfect for individual faculty - simple and fast**

- ✅ **5-minute setup** - minimal configuration
- ✅ **Lightweight** - just Python + HTML
- ✅ **Secure** - API key stays on your computer
- ✅ **No database** - no complex setup
- 👉 [Quick Start Guide](QUICKSTART.md)

### 🌐 Standalone HTML (Deprecated)
**Note: Doesn't work due to browser CORS restrictions**

- ❌ Cannot call Anthropic API from browser
- 👉 Use HTML + Proxy version instead

### 🐍 Django Web Application
**Perfect for institutions and teams**

- ✅ Secure server-side API key storage
- ✅ User authentication and access control
- ✅ Better for team environments
- 👉 See installation instructions below

---

## Django Web Application

A full-featured Django web application that allows faculty to generate AI-powered course content and export it as Common Cartridge files for import into Canvas LMS.

## Features

- **AI-Powered Content Generation**: Uses Claude AI to create comprehensive course content
- **Web Interface**: Simple, user-friendly form for inputting course parameters
- **Structured Course Design**: Generates weekly modules with introduction and lecture pages
- **Learning Objectives**: Each week includes clearly defined learning objectives
- **Common Cartridge Export**: Exports as IMS Common Cartridge 1.1 format for Canvas import

## What Gets Generated

For each week of your course, the tool creates:
- **Introduction Page**: Engaging introduction with learning objectives and context
- **Lecture Page**: Comprehensive lecture content covering the weekly topic

All content is organized into weekly modules and packaged as a Common Cartridge (.imscc) file.

## Requirements

- Python 3.8+
- Anthropic API key
- Canvas LMS access (for importing the generated content)

## Installation

1. **Clone or navigate to the repository**
   ```bash
   cd /path/to/Canvas
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

4. **Run database migrations**
   ```bash
   python manage.py migrate
   ```

5. **Start the development server**
   ```bash
   python manage.py runserver
   ```

6. **Access the application**
   Open your browser to `http://localhost:8000`

## Usage

### Generating Course Content

1. Navigate to the home page
2. Fill out the course generation form:
   - **Course Name**: Full name of your course (e.g., "Introduction to Psychology")
   - **Subject Area**: The subject or discipline (e.g., "Psychology")
   - **Number of Weeks**: How many weeks the course runs (1-52)
   - **Target Audience**: Student level (undergraduate, graduate, etc.)
   - **Additional Context** (optional): Any specific requirements or topics

3. Click "Generate Course Content"
4. Wait for the generation process to complete (may take several minutes)
5. Download the generated .imscc file

### Importing to Canvas

1. In Canvas, navigate to your course
2. Click **Settings** in the course navigation
3. Click **Import Course Content**
4. Select **Common Cartridge 1.x Package** as the content type
5. Click **Choose File** and upload the .imscc file
6. Click **Import**
7. Wait for the import to complete
8. Review and publish the imported content

## Project Structure

```
Canvas/
├── faculty_content_tool/     # Django project settings
│   ├── settings.py          # Main configuration
│   └── urls.py              # URL routing
├── content_generator/        # Main application
│   ├── forms.py             # Course generation form
│   ├── views.py             # View logic
│   ├── claude_service.py    # Claude API integration
│   ├── cartridge_builder.py # Common Cartridge export
│   └── templates/           # HTML templates
├── media/                    # Generated cartridge files
├── requirements.txt          # Python dependencies
├── .env.example             # Environment variables template
└── README.md                # This file
```

## How It Works

1. **Form Submission**: Faculty submit course parameters through the web form
2. **Course Structure Generation**: Claude AI generates a course outline with weekly topics and learning objectives
3. **Content Generation**: For each week, Claude AI generates:
   - An introduction page with learning objectives
   - A comprehensive lecture page
4. **Common Cartridge Building**: All content is packaged into a valid IMS CC 1.1 file
5. **Download**: The .imscc file is provided for download

## Technology Stack

- **Backend**: Django 4.2+
- **AI Engine**: Anthropic Claude API
- **Export Format**: IMS Common Cartridge 1.1
- **Language**: Python 3

## Tips for Best Results

- Be specific in the subject area (e.g., "Cognitive Psychology" vs. "Psychology")
- Use the additional context field to specify particular topics or approaches
- Choose the appropriate target audience for content difficulty
- Review and customize generated content in Canvas after import
- Start with a smaller number of weeks (e.g., 2-3) to test the output

## Customization

After importing to Canvas, you can:
- Edit any generated content
- Add assignments, quizzes, and discussions
- Reorder or reorganize modules
- Add multimedia content
- Customize the styling and formatting

## Troubleshooting

### API Key Not Configured
- Ensure `.env` file exists with `ANTHROPIC_API_KEY` set
- Restart the Django server after setting the API key

### Generation Takes Too Long
- Generation time increases with the number of weeks
- Each week requires multiple API calls
- For courses with many weeks, consider generating in batches

### Import Fails in Canvas
- Ensure the file has .imscc extension
- Verify you selected "Common Cartridge 1.x Package" as import type
- Check Canvas import logs for specific errors

## License

This tool is provided as-is for educational purposes.

## Support

For issues or questions, please refer to the Django and Canvas LMS documentation.
