import os
import uuid
import zipfile
from datetime import datetime
from pathlib import Path
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom


class CommonCartridgeBuilder:
    """Builds IMS Common Cartridge 1.1 packages"""

    def __init__(self, course_structure, output_dir):
        self.course_structure = course_structure
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

    def _create_manifest(self, resources, organizations):
        """Create the imsmanifest.xml file"""
        # Root manifest element with namespaces
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

    def _create_organizations(self, modules):
        """Create the organizations element with course structure"""
        org = Element('organization', {
            'identifier': self._generate_identifier('org_'),
            'structure': 'rooted-hierarchy'
        })

        title = SubElement(org, 'title')
        title.text = self.course_structure['course_title']

        # Add each week as an item (module)
        for module in modules:
            org.append(module)

        return org

    def _create_module_item(self, week_data, intro_resource_id, lecture_resource_id):
        """Create a module item for a week"""
        item = Element('item', {
            'identifier': self._generate_identifier('item_module_')
        })

        title = SubElement(item, 'title')
        title.text = f"Week {week_data['week_number']}: {week_data['topic']}"

        # Add intro page item
        intro_item = SubElement(item, 'item', {
            'identifier': self._generate_identifier('item_'),
            'identifierref': intro_resource_id
        })
        intro_title = SubElement(intro_item, 'title')
        intro_title.text = f"Week {week_data['week_number']} Introduction"

        # Add lecture page item
        lecture_item = SubElement(item, 'item', {
            'identifier': self._generate_identifier('item_'),
            'identifierref': lecture_resource_id
        })
        lecture_title = SubElement(lecture_item, 'title')
        lecture_title.text = f"Week {week_data['week_number']} Lecture"

        return item

    def _create_resource(self, identifier, href, title):
        """Create a webcontent resource element"""
        resource = Element('resource', {
            'identifier': identifier,
            'type': 'webcontent',
            'href': href
        })

        file_elem = SubElement(resource, 'file', {'href': href})

        return resource

    def _create_html_page(self, title, content, learning_objectives=None):
        """Create an HTML page with proper structure"""
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
        h1, h2, h3 {{
            color: #333;
        }}
        .objectives {{
            background-color: #f5f5f5;
            padding: 15px;
            border-left: 4px solid #0066cc;
            margin: 20px 0;
        }}
        .objectives h3 {{
            margin-top: 0;
        }}
        .objectives ul {{
            margin-bottom: 0;
        }}
    </style>
</head>
<body>
    <h1>{title}</h1>
"""
        if learning_objectives:
            html += """
    <div class="objectives">
        <h3>Learning Objectives</h3>
        <ul>
"""
            for obj in learning_objectives:
                html += f"            <li>{obj}</li>\n"
            html += """        </ul>
    </div>
"""
        html += f"""
    {content}
</body>
</html>"""
        return html

    def build(self):
        """Build the complete Common Cartridge package"""
        resources = []
        modules = []

        # Create pages for each week
        for week in self.course_structure['weeks']:
            week_num = week['week_number']

            # Create intro page
            intro_filename = f"week_{week_num}_intro.html"
            intro_resource_id = self._generate_identifier('res_')
            intro_html = self._create_html_page(
                f"Week {week_num} Introduction: {week['topic']}",
                week['intro_page'],
                week['learning_objectives']
            )

            intro_path = self.temp_dir / intro_filename
            with open(intro_path, 'w', encoding='utf-8') as f:
                f.write(intro_html)

            resources.append(self._create_resource(
                intro_resource_id,
                intro_filename,
                f"Week {week_num} Introduction"
            ))

            # Create lecture page
            lecture_filename = f"week_{week_num}_lecture.html"
            lecture_resource_id = self._generate_identifier('res_')
            lecture_html = self._create_html_page(
                f"Week {week_num} Lecture: {week['topic']}",
                week['lecture_page']
            )

            lecture_path = self.temp_dir / lecture_filename
            with open(lecture_path, 'w', encoding='utf-8') as f:
                f.write(lecture_html)

            resources.append(self._create_resource(
                lecture_resource_id,
                lecture_filename,
                f"Week {week_num} Lecture"
            ))

            # Create module item
            module_item = self._create_module_item(week, intro_resource_id, lecture_resource_id)
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
        course_title_safe = "".join(c for c in self.course_structure['course_title'] if c.isalnum() or c in (' ', '-', '_')).rstrip()
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
