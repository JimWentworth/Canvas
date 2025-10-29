from django.test import TestCase, Client
from django.urls import reverse
from .forms import CourseGenerationForm


class CourseGenerationFormTests(TestCase):
    """Test the course generation form"""

    def test_form_valid_data(self):
        """Test form with valid data"""
        form = CourseGenerationForm(data={
            'course_name': 'Introduction to Psychology',
            'subject_area': 'Psychology',
            'num_weeks': 16,
            'target_audience': 'undergraduate_introductory',
            'additional_context': 'Focus on cognitive psychology'
        })
        self.assertTrue(form.is_valid())

    def test_form_missing_required_fields(self):
        """Test form with missing required fields"""
        form = CourseGenerationForm(data={})
        self.assertFalse(form.is_valid())
        self.assertIn('course_name', form.errors)
        self.assertIn('subject_area', form.errors)
        self.assertIn('num_weeks', form.errors)
        self.assertIn('target_audience', form.errors)

    def test_form_invalid_num_weeks(self):
        """Test form with invalid number of weeks"""
        form = CourseGenerationForm(data={
            'course_name': 'Test Course',
            'subject_area': 'Testing',
            'num_weeks': 100,  # Too many weeks
            'target_audience': 'undergraduate_introductory'
        })
        self.assertFalse(form.is_valid())
        self.assertIn('num_weeks', form.errors)


class ViewTests(TestCase):
    """Test the views"""

    def setUp(self):
        self.client = Client()

    def test_index_view_get(self):
        """Test GET request to index view"""
        response = self.client.get(reverse('content_generator:index'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Generate AI-Powered Course Content')
        self.assertIsInstance(response.context['form'], CourseGenerationForm)

    def test_about_view(self):
        """Test about page"""
        response = self.client.get(reverse('content_generator:about'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'About the Faculty AI Content Tool')
