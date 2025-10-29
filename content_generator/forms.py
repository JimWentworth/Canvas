from django import forms


class CourseGenerationForm(forms.Form):
    """Form for faculty to input course generation parameters"""

    course_name = forms.CharField(
        max_length=200,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'e.g., Introduction to Psychology'
        }),
        help_text='The full name of your course'
    )

    subject_area = forms.CharField(
        max_length=200,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'e.g., Psychology, Computer Science, History'
        }),
        help_text='The subject or discipline of your course'
    )

    num_weeks = forms.IntegerField(
        min_value=1,
        max_value=52,
        initial=16,
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'placeholder': '16'
        }),
        help_text='Number of weeks for the course (1-52)'
    )

    target_audience = forms.ChoiceField(
        choices=[
            ('undergraduate_introductory', 'Undergraduate - Introductory'),
            ('undergraduate_intermediate', 'Undergraduate - Intermediate'),
            ('undergraduate_advanced', 'Undergraduate - Advanced'),
            ('graduate_masters', 'Graduate - Masters'),
            ('graduate_doctoral', 'Graduate - Doctoral'),
            ('professional_development', 'Professional Development'),
        ],
        widget=forms.Select(attrs={
            'class': 'form-control'
        }),
        help_text='The intended audience for this course'
    )

    additional_context = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'rows': 4,
            'placeholder': 'Any additional context or requirements for the course content...'
        }),
        help_text='Optional: Provide any additional context, specific topics, or requirements'
    )
