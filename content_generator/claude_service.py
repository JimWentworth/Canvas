import json
from anthropic import Anthropic
from django.conf import settings


class ClaudeContentGenerator:
    """Service for generating course content using Claude API"""

    def __init__(self):
        self.client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    def generate_course_structure(self, course_name, subject_area, num_weeks, target_audience, additional_context=""):
        """
        Generate a course structure with weekly topics and learning objectives
        Returns a list of weeks with topics and objectives
        """
        prompt = f"""You are an expert instructional designer creating a course structure.

Course Details:
- Course Name: {course_name}
- Subject Area: {subject_area}
- Number of Weeks: {num_weeks}
- Target Audience: {target_audience}
{f"- Additional Context: {additional_context}" if additional_context else ""}

Please create a comprehensive course structure with:
1. A weekly topic/theme for each of the {num_weeks} weeks
2. 3-5 specific learning objectives for each week

Return your response in the following JSON format:
{{
  "course_title": "{course_name}",
  "weeks": [
    {{
      "week_number": 1,
      "topic": "Week topic/theme",
      "learning_objectives": [
        "Objective 1",
        "Objective 2",
        "Objective 3"
      ]
    }},
    ...
  ]
}}

Ensure the topics progress logically from foundational concepts to more advanced material."""

        response = self.client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=4096,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        # Extract JSON from response
        content = response.content[0].text
        # Try to find JSON in the response
        json_start = content.find('{')
        json_end = content.rfind('}') + 1
        if json_start != -1 and json_end != 0:
            json_str = content[json_start:json_end]
            return json.loads(json_str)
        else:
            raise ValueError("Could not parse course structure from Claude response")

    def generate_intro_page(self, course_name, subject_area, week_number, topic, learning_objectives, target_audience):
        """Generate an introduction page for a weekly module"""
        objectives_list = "\n".join([f"- {obj}" for obj in learning_objectives])

        prompt = f"""You are an expert instructional designer creating engaging course content.

Create an introduction page for Week {week_number} of a {subject_area} course titled "{course_name}" for {target_audience} students.

Week {week_number} Topic: {topic}

Learning Objectives:
{objectives_list}

Write a compelling and informative introduction page that:
1. Welcomes students to the week
2. Provides context for why this topic is important
3. Clearly states the learning objectives
4. Gives an overview of what students will learn
5. Motivates students to engage with the material

Format the content in HTML suitable for a Canvas LMS page. Use appropriate headings, paragraphs, and lists. Keep the tone professional but engaging."""

        response = self.client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2048,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        return response.content[0].text

    def generate_lecture_page(self, course_name, subject_area, week_number, topic, learning_objectives, target_audience):
        """Generate a lecture content page for a weekly module"""
        objectives_list = "\n".join([f"- {obj}" for obj in learning_objectives])

        prompt = f"""You are an expert instructional designer creating comprehensive lecture content.

Create a detailed lecture page for Week {week_number} of a {subject_area} course titled "{course_name}" for {target_audience} students.

Week {week_number} Topic: {topic}

Learning Objectives:
{objectives_list}

Write comprehensive lecture content that:
1. Thoroughly covers the topic with clear explanations
2. Includes relevant examples and illustrations
3. Breaks down complex concepts into understandable parts
4. Addresses each learning objective
5. Includes key terms and definitions
6. Provides practical applications or real-world connections
7. Ends with a summary of key takeaways

Format the content in HTML suitable for a Canvas LMS page. Use appropriate headings (h2, h3), paragraphs, lists, and emphasis. Make it well-structured and easy to follow. Aim for substantial, high-quality educational content."""

        response = self.client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=4096,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        return response.content[0].text

    def generate_full_course(self, course_name, subject_area, num_weeks, target_audience, additional_context=""):
        """
        Generate complete course content including structure and all pages
        Returns a complete course structure with all content generated
        """
        # First, generate the course structure
        course_structure = self.generate_course_structure(
            course_name, subject_area, num_weeks, target_audience, additional_context
        )

        # Then, generate content for each week
        for week in course_structure['weeks']:
            week_number = week['week_number']
            topic = week['topic']
            objectives = week['learning_objectives']

            # Generate intro page
            week['intro_page'] = self.generate_intro_page(
                course_name, subject_area, week_number, topic, objectives, target_audience
            )

            # Generate lecture page
            week['lecture_page'] = self.generate_lecture_page(
                course_name, subject_area, week_number, topic, objectives, target_audience
            )

        return course_structure
