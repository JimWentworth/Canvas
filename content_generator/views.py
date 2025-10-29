from django.shortcuts import render
from django.http import FileResponse, HttpResponse
from django.conf import settings
from django.contrib import messages
from .forms import CourseGenerationForm
from .claude_service import ClaudeContentGenerator
from .cartridge_builder import CommonCartridgeBuilder
import os


def index(request):
    """Main view for the course generation form"""
    if request.method == 'POST':
        form = CourseGenerationForm(request.POST)
        if form.is_valid():
            try:
                # Extract form data
                course_name = form.cleaned_data['course_name']
                subject_area = form.cleaned_data['subject_area']
                num_weeks = form.cleaned_data['num_weeks']
                target_audience = form.cleaned_data['target_audience']
                additional_context = form.cleaned_data.get('additional_context', '')

                # Check if API key is configured
                if not settings.ANTHROPIC_API_KEY:
                    messages.error(request, 'Anthropic API key is not configured. Please set ANTHROPIC_API_KEY in your .env file.')
                    return render(request, 'content_generator/index.html', {'form': form})

                # Generate course content
                generator = ClaudeContentGenerator()
                messages.info(request, f'Generating content for {num_weeks} weeks... This may take a few minutes.')

                course_structure = generator.generate_full_course(
                    course_name,
                    subject_area,
                    num_weeks,
                    target_audience,
                    additional_context
                )

                # Build Common Cartridge package
                media_dir = settings.MEDIA_ROOT
                builder = CommonCartridgeBuilder(course_structure, media_dir)
                cartridge_path = builder.build()

                # Serve the file for download
                response = FileResponse(
                    open(cartridge_path, 'rb'),
                    as_attachment=True,
                    filename=os.path.basename(cartridge_path)
                )
                return response

            except Exception as e:
                messages.error(request, f'Error generating course: {str(e)}')
                return render(request, 'content_generator/index.html', {'form': form})
    else:
        form = CourseGenerationForm()

    return render(request, 'content_generator/index.html', {'form': form})


def about(request):
    """About page with instructions"""
    return render(request, 'content_generator/about.html')
