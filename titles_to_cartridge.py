#!/usr/bin/env python3
"""
Simple script to convert a list of titles into a Common Cartridge package.
Each title becomes:
1. An HTML page with that title
2. A module in Canvas with the same title
3. The page is the first (and only) item in that module
"""

import os
import uuid
import zipfile
from datetime import datetime
from pathlib import Path
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom


class TitlesToCartridgeBuilder:
    """Builds a Common Cartridge from a list of page titles"""

    def __init__(self, course_title, page_titles, output_dir="output"):
        self.course_title = course_title
        self.page_titles = page_titles
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.temp_dir = self.output_dir / f"temp_{uuid.uuid4().hex}"
        self.temp_dir.mkdir(parents=True, exist_ok=True)
        self.resource_counter = 0

    def _generate_identifier(self, prefix=""):
        """Generate a unique identifier"""
        self.resource_counter += 1
        return f"{prefix}{uuid.uuid4().hex[:12]}"

    def _prettify_xml(self, elem):
        """Return a pretty-printed XML string"""
        rough_string = tostring(elem, encoding='unicode')
        reparsed = minidom.parseString(rough_string)
        return reparsed.toprettyxml(indent="  ")

    def _create_html_page(self, title):
        """Create a basic HTML page with the given title"""
        html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{title}</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }}
        h1 {{
            color: #333;
            border-bottom: 2px solid #0066cc;
            padding-bottom: 10px;
        }}
        .content {{
            margin-top: 30px;
            min-height: 200px;
        }}
    </style>
</head>
<body>
    <h1>{title}</h1>
    <div class="content">
        <p>Content for {title}</p>
    </div>
</body>
</html>"""
        return html

    def _create_resource(self, identifier, href):
        """Create a webcontent resource element"""
        resource = Element('resource', {
            'identifier': identifier,
            'type': 'webcontent',
            'href': href
        })
        SubElement(resource, 'file', {'href': href})
        return resource

    def _create_module_item(self, title, resource_id, index):
        """Create a module item with a single page"""
        # Module item (this becomes a module in Canvas)
        module_item = Element('item', {
            'identifier': self._generate_identifier('item_module_')
        })

        module_title = SubElement(module_item, 'title')
        module_title.text = title

        # Page item (this becomes the page within the module)
        page_item = SubElement(module_item, 'item', {
            'identifier': self._generate_identifier('item_page_'),
            'identifierref': resource_id
        })

        page_title = SubElement(page_item, 'title')
        page_title.text = title

        return module_item

    def _create_organizations(self, modules):
        """Create the organizations element with course structure"""
        org = Element('organization', {
            'identifier': self._generate_identifier('org_'),
            'structure': 'rooted-hierarchy'
        })

        title = SubElement(org, 'title')
        title.text = self.course_title

        # Add each module
        for module in modules:
            org.append(module)

        return org

    def _create_manifest(self, resources, organizations):
        """Create the imsmanifest.xml file"""
        manifest = Element('manifest', {
            'identifier': self._generate_identifier('man_'),
            'xmlns': 'http://www.imsglobal.org/xsd/imsccv1p1/imscp_v1p1',
            'xmlns:lom': 'http://ltsc.ieee.org/xsd/imsccv1p1/LOM/resource',
            'xmlns:lomimscc': 'http://ltsc.ieee.org/xsd/imsccv1p1/LOM/manifest',
            'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            'xsi:schemaLocation': 'http://www.imsglobal.org/xsd/imsccv1p1/imscp_v1p1 http://www.imsglobal.org/profile/cc/ccv1p1/ccv1p1_imscp_v1p2_v1p0.xsd http://ltsc.ieee.org/xsd/imsccv1p1/LOM/resource http://www.imsglobal.org/profile/cc/ccv1p1/LOM/ccv1p1_lomresource_v1p0.xsd http://ltsc.ieee.org/xsd/imsccv1p1/LOM/manifest http://www.imsglobal.org/profile/cc/ccv1p1/LOM/ccv1p1_lommanifest_v1p0.xsd'
        })

        # Metadata
        metadata = SubElement(manifest, 'metadata')
        schema = SubElement(metadata, 'schema')
        schema.text = 'IMS Common Cartridge'
        schemaversion = SubElement(metadata, 'schemaversion')
        schemaversion.text = '1.1.0'

        # Organizations (course structure)
        orgs_elem = SubElement(manifest, 'organizations')
        orgs_elem.append(organizations)

        # Resources
        resources_elem = SubElement(manifest, 'resources')
        for resource in resources:
            resources_elem.append(resource)

        return self._prettify_xml(manifest)

    def build(self):
        """Build the complete Common Cartridge package"""
        resources = []
        modules = []

        # Create a page and module for each title
        for index, page_title in enumerate(self.page_titles, 1):
            # Create HTML file
            filename = f"page_{index:02d}.html"
            resource_id = self._generate_identifier('res_')

            html_content = self._create_html_page(page_title)

            # Write HTML file
            html_path = self.temp_dir / filename
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(html_content)

            # Create resource
            resources.append(self._create_resource(resource_id, filename))

            # Create module item
            module_item = self._create_module_item(page_title, resource_id, index)
            modules.append(module_item)

        # Create organizations
        organizations = self._create_organizations(modules)

        # Create manifest
        manifest_xml = self._create_manifest(resources, organizations)

        # Write manifest file
        manifest_path = self.temp_dir / 'imsmanifest.xml'
        with open(manifest_path, 'w', encoding='utf-8') as f:
            f.write(manifest_xml)

        # Create the zip file (Common Cartridge package)
        course_title_safe = "".join(
            c for c in self.course_title
            if c.isalnum() or c in (' ', '-', '_')
        ).rstrip()
        course_title_safe = course_title_safe.replace(' ', '_')
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        zip_filename = f"{course_title_safe}_{timestamp}.imscc"
        zip_path = self.output_dir / zip_filename

        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for file_path in self.temp_dir.rglob('*'):
                if file_path.is_file():
                    arcname = file_path.relative_to(self.temp_dir)
                    zipf.write(file_path, arcname)

        # Clean up temp directory
        import shutil
        shutil.rmtree(self.temp_dir)

        return zip_path


def main():
    """Example usage"""
    course_title = "The Story of the Unseen: Machine Learning as Mystery"

    page_titles = [
        "Opening the Case (Week 1)",
        "Opening the Case (Week 2)",
        "Case 1 (Week 3)",
        "Case 1 (Week 4)",
        "Case 1 (Week 5)",
        "Cross-Case Checkpoint 1 (Week 6)",
        "Case 2 (Week 7)",
        "Case 2 (Week 8)",
        "Case 2 (Week 9)",
        "Cross-Case Checkpoint 2 (Week 10)",
        "Case 3 (Week 11)",
        "Case 3 (Week 12)",
        "Case 3 (Week 13)",
        "The Network of Clues (Week 14)",
        "The Reveal (Week 15)",
    ]

    print(f"Building Common Cartridge for: {course_title}")
    print(f"Creating {len(page_titles)} pages/modules...")

    builder = TitlesToCartridgeBuilder(course_title, page_titles)
    output_path = builder.build()

    print(f"\n✓ Success! Common Cartridge created at:")
    print(f"  {output_path}")
    print(f"\nYou can now upload this .imscc file to Canvas:")
    print("  1. Go to your Canvas course")
    print("  2. Navigate to Settings → Import Course Content")
    print("  3. Choose 'Common Cartridge 1.x Package'")
    print("  4. Upload the .imscc file")


if __name__ == "__main__":
    main()
