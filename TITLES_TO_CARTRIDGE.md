# Titles to Common Cartridge Generator

A simple tool to convert a list of page titles into a Canvas-ready Common Cartridge package. Each title becomes both a module and a page in Canvas, with the page being the first item in its respective module.

## Features

- Creates basic HTML pages from a list of titles
- Each page is placed in its own module with the same name
- Generates IMS Common Cartridge 1.1 compliant packages
- Ready for direct upload to Canvas LMS
- Clean, professional HTML styling

## Quick Start

### Running the Example

The script includes an example with the course "The Story of the Unseen: Machine Learning as Mystery" and 15 weekly modules:

```bash
python3 titles_to_cartridge.py
```

This will create a file like:
```
output/The_Story_of_the_Unseen_Machine_Learning_as_Mystery_20251029_211303.imscc
```

### Using as a Python Module

You can also use the script programmatically:

```python
from titles_to_cartridge import TitlesToCartridgeBuilder

# Define your course
course_title = "My Course Title"
page_titles = [
    "Introduction",
    "Chapter 1: Getting Started",
    "Chapter 2: Advanced Topics",
    "Conclusion"
]

# Build the cartridge
builder = TitlesToCartridgeBuilder(course_title, page_titles)
output_path = builder.build()

print(f"Common Cartridge created at: {output_path}")
```

### Custom Output Directory

```python
builder = TitlesToCartridgeBuilder(
    course_title="My Course",
    page_titles=["Page 1", "Page 2"],
    output_dir="my_custom_output"
)
output_path = builder.build()
```

## Uploading to Canvas

1. Go to your Canvas course
2. Navigate to **Settings** → **Import Course Content**
3. Choose **Common Cartridge 1.x Package**
4. Upload the generated `.imscc` file
5. Click **Import**

Canvas will create:
- 15 modules (one for each title)
- 15 pages (one per module)
- Each page will be the first item in its module

## Structure Created

### Canvas Module Structure
```
Course: The Story of the Unseen: Machine Learning as Mystery
├── Module: Opening the Case (Week 1)
│   └── Page: Opening the Case (Week 1)
├── Module: Opening the Case (Week 2)
│   └── Page: Opening the Case (Week 2)
├── Module: Case 1 (Week 3)
│   └── Page: Case 1 (Week 3)
...
└── Module: The Reveal (Week 15)
    └── Page: The Reveal (Week 15)
```

### HTML Page Structure

Each page includes:
- Proper HTML5 structure
- UTF-8 encoding
- Professional CSS styling
- Centered layout (max 800px width)
- Blue bottom border on headings
- Placeholder content area

Example:
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Opening the Case (Week 1)</title>
    <style>
        /* Professional styling */
    </style>
</head>
<body>
    <h1>Opening the Case (Week 1)</h1>
    <div class="content">
        <p>Content for Opening the Case (Week 1)</p>
    </div>
</body>
</html>
```

## Common Cartridge Details

The script generates:

- **Format**: IMS Common Cartridge 1.1
- **Compatibility**: Canvas, Moodle, Blackboard, Brightspace D2L
- **Package Type**: `.imscc` (ZIP archive)
- **Contents**:
  - `imsmanifest.xml` - Course structure and metadata
  - `page_01.html` through `page_15.html` - HTML pages

## Customizing Page Content

To customize the HTML content of each page, modify the `_create_html_page()` method in `TitlesToCartridgeBuilder` class:

```python
def _create_html_page(self, title):
    """Create a basic HTML page with the given title"""
    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{title}</title>
    <style>
        /* Add your custom CSS here */
    </style>
</head>
<body>
    <h1>{title}</h1>
    <div class="content">
        <!-- Add your custom content here -->
        <p>Your custom content for {title}</p>
    </div>
</body>
</html>"""
    return html
```

## Modifying the Example Data

Edit the `main()` function in `titles_to_cartridge.py`:

```python
def main():
    course_title = "Your Course Title"

    page_titles = [
        "Your Title 1",
        "Your Title 2",
        # Add as many titles as needed
    ]

    builder = TitlesToCartridgeBuilder(course_title, page_titles)
    output_path = builder.build()
```

## Technical Details

### Module/Page Relationship
- Each Canvas module contains exactly one page
- Module title = Page title
- Pages are numbered sequentially (page_01.html, page_02.html, etc.)
- Resources are linked via unique identifiers in the manifest

### XML Structure
```xml
<organization>
  <title>Course Title</title>
  <item identifier="item_module_xxx">  <!-- Module -->
    <title>Page Title</title>
    <item identifierref="res_xxx">     <!-- Page -->
      <title>Page Title</title>
    </item>
  </item>
</organization>
```

## Troubleshooting

### Import Fails in Canvas
- Verify the `.imscc` file is not corrupted
- Check that Canvas supports Common Cartridge 1.1
- Try re-generating the package

### Pages Not Appearing in Modules
- This script ensures each page is the first item in its module
- If pages appear separately, check Canvas import settings

### Special Characters in Titles
- The script handles special characters in course titles
- File names use sanitized versions (alphanumeric + spaces/hyphens/underscores)

## Related Tools

This project also includes:
- **Faculty AI Content Tool** (`content_generator/`) - AI-powered course content generation
- **Standalone HTML Generator** (`faculty_content_generator.html`) - Browser-based tool
- **Common Cartridge Builder** (`content_generator/cartridge_builder.py`) - Full-featured builder

## License

Part of the Faculty AI Content Tool project.
