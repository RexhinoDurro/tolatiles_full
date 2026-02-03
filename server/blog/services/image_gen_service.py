import os
import uuid
import base64
import urllib.request
import urllib.parse
from django.conf import settings


class ImageGenerationService:
    """Service for AI image generation using multiple providers."""

    ASPECT_RATIOS = ['1:1', '3:4', '4:3', '9:16', '16:9']

    def __init__(self):
        self.api_key = getattr(settings, 'GEMINI_API_KEY', None)
        self.client = None
        self._initialized = False

    def _initialize(self):
        """Lazily initialize the Gemini client."""
        if self._initialized:
            return

        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except ImportError:
                pass
        self._initialized = True

    def enhance_prompt(self, prompt, context=None):
        """Enhance an image prompt using AI."""
        self._initialize()

        if not self.client:
            return prompt

        enhancement_prompt = f"""You are an expert at writing prompts for AI image generation.
Enhance the following image prompt to be more descriptive and specific for generating
a high-quality, professional image suitable for a tile installation company blog.

Original prompt: {prompt}

{'Blog context: ' + context[:500] if context else ''}

Requirements:
- Make the prompt more descriptive with details about lighting, composition, style
- Keep it appropriate for a professional tile/home improvement context
- Focus on photorealistic, high-quality imagery
- Do not add text overlays or watermarks to the image description
- Keep the enhanced prompt under 400 characters

Return ONLY the enhanced prompt, nothing else."""

        try:
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=enhancement_prompt
            )
            return response.text.strip()
        except Exception:
            return prompt

    def generate_image(self, prompt, aspect_ratio='1:1'):
        """
        Generate an image. Tries multiple providers in order:
        1. Google Gemini/Imagen (if billing enabled)
        2. Pollinations.ai (free, no API key needed)
        """
        self._initialize()

        if aspect_ratio not in self.ASPECT_RATIOS:
            aspect_ratio = '1:1'

        # Try Google Gemini first if available
        if self.client:
            result = self._generate_with_gemini(prompt, aspect_ratio)
            if result and 'url' in result:
                return result
            # If quota error, fall through to Pollinations

        # Fallback to Pollinations.ai (free)
        return self._generate_with_pollinations(prompt, aspect_ratio)

    def _generate_with_gemini(self, prompt, aspect_ratio):
        """Try generating with Google Gemini/Imagen."""
        try:
            from google.genai import types

            # Try Gemini 2.0 Flash image generation model
            response = self.client.models.generate_content(
                model='gemini-2.0-flash-exp-image-generation',
                contents=f"Generate a professional photograph: {prompt}",
                config=types.GenerateContentConfig(
                    response_modalities=['IMAGE', 'TEXT']
                )
            )

            # Extract image from response
            if response.candidates:
                for part in response.candidates[0].content.parts:
                    if hasattr(part, 'inline_data') and part.inline_data:
                        if part.inline_data.mime_type.startswith('image/'):
                            image_bytes = part.inline_data.data
                            if isinstance(image_bytes, str):
                                image_bytes = base64.b64decode(image_bytes)
                            return self._save_image(image_bytes, aspect_ratio)

            return None
        except Exception as e:
            error_msg = str(e)
            # If quota exceeded or billing required, return None to try fallback
            if 'RESOURCE_EXHAUSTED' in error_msg or 'quota' in error_msg.lower() or 'billing' in error_msg.lower():
                return None
            if 'SAFETY' in error_msg.upper() or 'BLOCKED' in error_msg.upper():
                return {'error': 'Image was blocked by safety filters. Try a different prompt.'}
            return None

    def _generate_with_pollinations(self, prompt, aspect_ratio):
        """Generate image using Pollinations.ai (free, no API key)."""
        try:
            # Map aspect ratios to dimensions
            dimensions = {
                '1:1': (1024, 1024),
                '16:9': (1280, 720),
                '4:3': (1024, 768),
                '3:4': (768, 1024),
                '9:16': (720, 1280),
            }
            width, height = dimensions.get(aspect_ratio, (1024, 1024))

            # Enhance prompt for better results
            enhanced_prompt = f"professional photograph, high quality, {prompt}, detailed, sharp focus, good lighting"
            encoded_prompt = urllib.parse.quote(enhanced_prompt)

            # Pollinations.ai URL - generates image on the fly
            image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width={width}&height={height}&nologo=true&model=flux"

            # Download the image
            req = urllib.request.Request(
                image_url,
                headers={'User-Agent': 'Mozilla/5.0 (compatible; TolaTiles/1.0)'}
            )

            with urllib.request.urlopen(req, timeout=60) as response:
                image_bytes = response.read()

            if not image_bytes or len(image_bytes) < 1000:
                return {'error': 'Failed to generate image. Please try again.'}

            return self._save_image(image_bytes, aspect_ratio)

        except urllib.error.URLError as e:
            return {'error': f'Network error generating image: {str(e)}'}
        except Exception as e:
            return {'error': f'Image generation failed: {str(e)}'}

    def _save_image(self, image_bytes, aspect_ratio):
        """Save image bytes to file and return URL."""
        filename = f"ai_generated_{uuid.uuid4().hex[:12]}.png"
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'blog', 'ai-generated')
        os.makedirs(upload_dir, mode=0o755, exist_ok=True)

        file_path = os.path.join(upload_dir, filename)
        with open(file_path, 'wb') as f:
            f.write(image_bytes)
        os.chmod(file_path, 0o644)

        url = f"{settings.MEDIA_URL}blog/ai-generated/{filename}"

        return {
            'url': url,
            'filename': filename,
            'aspect_ratio': aspect_ratio
        }

    def get_available_aspect_ratios(self):
        """Return list of supported aspect ratios."""
        return [
            {'value': '1:1', 'label': 'Square (1:1)'},
            {'value': '16:9', 'label': 'Landscape (16:9)'},
            {'value': '4:3', 'label': 'Standard (4:3)'},
            {'value': '3:4', 'label': 'Portrait (3:4)'},
            {'value': '9:16', 'label': 'Tall (9:16)'},
        ]
